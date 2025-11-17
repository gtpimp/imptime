import logging
from .issue_serializer import IssueSerializer, IssueShareSerializer
from .issue_serializer import IssueGeneralDetailsSerializer
from .markdown_enrichment import MarkdownEnrichment
from .project_api import ProjectViewSet
from django.utils import timezone
from lib import hours_helper
from imptime.bulk_text_parser import BulkTextParser
from .issue_serializer import IssueWithEstimatesSerializer
from rest_framework.decorators import list_route, detail_route
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum, Q
from .base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory
from imptime.models import VisualSpecIssue
from timepiece.models import TagCategory, Tag, Entry, IssueStatus, IssuePoints
from timepiece.models import ProjectIssueOrder as SprintIssueOrder
from timepiece.models import IssueReview
from timepiece.models import ProjectStatus as SprintStatus
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import ProjectReview as SprintReview
from timepiece.models import BusinessPermissions as ProjectPermissions

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class IssueViewSet(BaseViewSet):

    def list(self, request):

        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            issues = self.allowed_issues()
            issues = self.apply_filter(qs=issues, raw_filter_args=filter_args)

            if 'sprint_id' in filter_args:
                issues = issues.order_by_project_id(project_id=filter_args['sprint_id']) #sic
            if 'copy_sprint_id' in filter_args:
                issues = issues.order_by_project_id(project_id=filter_args['copy_sprint_id']) #sic
                
            issues = self.apply_pagination(qs=issues, pagination=pagination)

            if format_args.get('ids_only', None):
                context['ids'] = [str(x) for x in issues.values_list(
                    'id', flat=True)]
            else:

                detail_levels = format_args.get('detail_level', '').split(",")
                if len(detail_levels) == 0:
                    s = IssueSerializer(issues, logged_in_user=request.user, many=True)
                elif 'estimates' in detail_levels:
                    s = IssueWithEstimatesSerializer(issues, many=True)
                elif 'general' in detail_levels:
                    s = IssueGeneralDetailsSerializer(issues, many=True)
                else:
                    issues = self._enrich_issues_qs(issues)
                    s = IssueSerializer(issues, logged_in_user=request.user, many=True)

                issues_data = s.data
                context['issues'] = issues_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    def _enrich_issues_qs(self, issues):
        issues = issues.select_related('parent_group')\
                       .select_related('project__business')\
                       .select_related('assigned_to')\
                       .select_related('status2')\
                       .prefetch_related('comments')\
                       .prefetch_related('group_children')\
                       .prefetch_related('issue_points__user')\
                       .prefetch_related('group_children')\
                       .prefetch_related('issues_needing_us')\
                       .prefetch_related('needs_issues')\
                       .prefetch_related('reviews')\
                       .prefetch_related('implements_testables')\
                       .prefetch_related('implements_testables__features')\
                       .prefetch_related('tags')\
                       .prefetch_related(Prefetch('entries', to_attr='active_clocks',
                                                  queryset=Entry.objects.select_related('user').filter(end_time__isnull=False)))\
                       .prefetch_related(Prefetch('entries', to_attr='my_entries',
                                                  queryset=Entry.objects.filter(user=self.request.user).select_related('user')))\
                       .prefetch_related(Prefetch('entries', to_attr='all_entries',
                                                  queryset=Entry.objects.order_by('user_id')))\
                       .prefetch_related(Prefetch('issue_points', to_attr='all_estimates'))\
                       .prefetch_related(Prefetch('issue_points', to_attr='my_estimate',
                                                  queryset=IssuePoints.objects.filter(user=self.request.user, issue__in=issues)))\
                       .prefetch_related(Prefetch('issue_points__user'))\
                       .prefetch_related(Prefetch('entries', to_attr='my_clocked_in_entries',
                                                  queryset=Entry.objects.filter(user=self.request.user).select_related('user').filter(end_time__isnull=True)))

        issues = issues.annotate(actual_hours=Sum('entries__hours'))
        return issues


    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params.get('value', None)

            if 'item_ids' in params:
                issue_pks = params['item_ids']
                project_id = Issue.objects.filter(pk=issue_pks[0]).values_list('project_id', flat=True)[0]
                issue_pks = SprintIssueOrder.sort_these_issue_ids(project_id, set(issue_pks))

                if field_name == 'issue_id_after':
                    # need to reverse sort because of how the function works
                    issue_pks = issue_pks.reverse()
            else:
                issue_pks = [pk]

            for issue_pk in issue_pks:
                issue = self.allowed_issue(issue_pk)

                if field_name == "subject":
                    if self.logged_in_permissions(issue.project.business).has_edit_subject:
                        old_subject = issue.subject
                        issue.subject = new_value
                        IssueHistory.add_history(
                            request.user, issue, "changed subject",
                            old_subject, issue.subject)
                elif field_name == "description":
                    if self.logged_in_permissions(issue.project.business).has_edit_description:
                        old_description = issue.description
                        issue.description = new_value
                        issue.enriched_description = MarkdownEnrichment(request.user).enrich(issue.description,
                                                                                             project_id=issue.project.business_id) #sic
                        IssueHistory.add_history(
                            request.user, issue, "changed description",
                            old_description, issue.description)
                elif field_name == "status_name":
                    if self.logged_in_permissions(issue.project.business).has_edit_issue_states:
                        old_status = issue.status2
                        new_status = IssueStatus.objects.get_or_create(business_id=issue.project.business_id,
                                                                       name=new_value)[0]
                        issue.status2_id = new_status.id
                        IssueHistory.add_history(
                            request.user, issue, "changed status",
                            old_status.name if old_status else '',
                            new_status.name)
                elif field_name == "type_name":
                    if self.logged_in_permissions(issue.project.business).has_add_issue:
                        old_value = issue.issue_type
                        issue.issue_type = new_value
                        IssueHistory.add_history(request.user, issue, "changed type", old_value, new_value)

                elif field_name == 'issue_id_after':
                    if self.logged_in_permissions(issue.project.business).has_edit_issues:
                        if new_value is None:
                            SprintIssueOrder.insert_at_the_beginning(issue)
                        else:
                            after_issue = self.allowed_issue(new_value)
                            SprintIssueOrder.insert_after(issue, set_after_this_issue=after_issue)
                elif field_name == 'assigned_to_id':
                    if self.logged_in_permissions(issue.project.business).has_assign_user:
                        old_assigned_to = \
                            issue.assigned_to.username \
                            if issue.assigned_to else "no-one"
                        issue.assigned_to_id = new_value
                        new_assigned_to = self.allowed_project_user(issue.project.business_id, new_value).username if new_value else "no-one"
                            
                        IssueHistory.add_history(
                            request.user, issue, "changed assigned to",
                            old_assigned_to, new_assigned_to)
                elif field_name == 'can_group_issues':
                    if self.logged_in_permissions(issue.project.business).has_edit_issues:
                        if new_value == 'toggle':
                            new_value = not issue.can_group_issues
                        
                        old_can_group_issues = issue.can_group_issues
                        issue.can_group_issues = new_value
                        IssueHistory.add_history(
                            request.user, issue, "changed can group issues to",
                            old_can_group_issues, new_value)
                elif field_name == 'parent_group_id':
                    if self.logged_in_permissions(issue.project.business).has_edit_issues:
                        if new_value and issue.id == int(new_value):
                            logger.warning("Trying to set an issue as a parent of itself: %d" % issue.id)
                        else:
                            old_parent_group_id = issue.parent_group_id
                            issue.parent_group_id = new_value
                            IssueHistory.add_history(
                                request.user, issue, "changed parent group id",
                                old_parent_group_id, new_value)
                            if old_parent_group_id:
                                old_parent_issue = self.allowed_issue(old_parent_group_id)
                                old_parent_issue.save()
                            if new_value:
                                new_parent_issue = self.allowed_issue(new_value)
                                new_parent_issue.save()
                elif field_name == 'sprint_id':
                    if self.logged_in_permissions(issue.project.business).has_edit_issues:
                        old_sprint = issue.project
                        new_sprint = self.allowed_sprint(new_value)
                        issue.project = new_sprint
                        issue.save()
                        SprintIssueOrder.insert_at_the_end(issue)
                        IssueHistory.add_history(request.user, issue, "moved to sprint", unicode(old_sprint), unicode(new_sprint))
                        old_sprint.save()
                elif field_name == 'copy_sprint_id':
                    if self.logged_in_permissions(issue.project.business).has_edit_issues:
                        old_sprint = issue.project
                        new_sprint = self.allowed_sprint(new_value)
                        add_suffix = False
                        if old_sprint.pk == new_sprint.pk:
                            add_suffix = True
                        new_issue = issue.copy(logged_in_user=request.user, add_suffix=add_suffix)
                        new_issue.project = new_sprint
                        new_issue.save()
                        SprintIssueOrder.insert_at_the_end(new_issue)
                        old_sprint.save()
                        new_sprint.save()
                elif field_name == "my_estimate":
                    if self.logged_in_permissions(issue.project.business).has_estimate_own_points:
                        estimate = IssuePoints.objects.get_or_create(user=request.user, issue=issue)[0]
                        old_estimate_hours = estimate.points if estimate.points is not None else "not set"
                        try:
                            estimate.points = hours_helper.convert_to_decimal(new_value)
                        except ValueError:
                            estimate.points = 0
                        estimate.save()
                        IssueHistory.add_history(request.user, issue,
                                                 "changed estimate for %s" % request.user, old_estimate_hours, new_value)
                elif field_name == "review_now":
                    if SprintReview.objects.filter(project_id=issue.project_id, review_by=request.user).first() is not None:
                        IssueReview.reviewed(issue, request.user)

                elif field_name == "due_date":
                    if self.logged_in_permissions(issue.project.business).has_edit_issues:
                        old_due_date = issue.due_date
                        issue.due_date = new_value
                        IssueHistory.add_history(request.user, issue, "changed due date",
                                                 str(old_due_date), str(issue.due_date))
                        
                elif field_name == "make_feature_issues_successive":
                    sprint_id = new_value
                    feature_issue = issue
                    child_issues = Issue.objects.filter(parent_group=feature_issue, project_id=sprint_id)\
                                                .order_by_project_id(project_id=sprint_id, descending=True) #sic
                    for child_issue in child_issues:
                        SprintIssueOrder.insert_after(child_issue, set_after_this_issue=feature_issue)
                elif field_name == "risky":
                    old_value = issue.risky
                    issue.risky = (new_value == 1)
                    IssueHistory.add_history(request.user, issue, "changed risky", old_value, new_value)
                else: 
                    raise Exception("Unsupported field name: %s" % field_name)
                issue.save()

                if issue.project.issues_can_be_reviewed and \
                   SprintReview.objects.filter(project_id=issue.project_id, review_by=request.user).first() is not None:
                    IssueReview.reviewed(issue, request.user)

            data = {'status': 'success', 'payload': issue_pks}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):

        try:
            context = {}
            params = request.data['item']
            sprint_id = params['sprint_id']
            issue_id_before = params.get('issue_id_before', None)
            assigned_to_id = params.get('assigned_to_id', None)
            due_now = params.get('due_now', None)

            sprint = self.allowed_sprint(sprint_id)
            if not self.logged_in_permissions(sprint.business).has_add_issue:
                raise Exception('Permission denied to create issues')

            def create_issue():
                issue_status = IssueStatus.objects.get_or_create(name='new', business=sprint.business)[0]
                issue = Issue.objects.create(project_id=sprint.id,   # sic
                                             status2 = issue_status,
                                             assigned_to_id = assigned_to_id,
                                             number=Issue.get_next_issue_number(sprint.business),
                                             subject=params['subject'],
                                             created_by=request.user,
                                             due_date=timezone.now() if due_now else None,
                                             can_group_issues=params.get('can_group_issues', False),
                                             issue_type=params.get('issue_type', 'issue'))

                if issue_id_before is None:
                    SprintIssueOrder.insert_at_the_end(issue)
                else:
                    issue_before = self.allowed_issue(issue_id_before)
                    if issue_before.project_id != issue.project_id:
                        SprintIssueOrder.insert_at_the_end(issue)
                    else:
                        SprintIssueOrder.insert_after(issue, set_after_this_issue=issue_before)
                        self._set_parent_group_for_new_issue(issue, params.get('selected_issue_ids'))

                IssueHistory.add_history(request.user, issue,
                                             "created", "", issue.number)
                IssueReview.reviewed(issue, request.user)
                return issue

            issue = create_issue()
            issue = self._enrich_issues_qs(Issue.objects.filter(pk=issue.id)).first()
            context['item'] = IssueSerializer(issue, logged_in_user=request.user).data
            data = {'status': 'success', 'payload': context}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        res = HttpResponse(JSONRenderer().render(data))
        return res

    def _set_parent_group_for_new_issue(self, new_issue, selected_issue_ids):
        if not selected_issue_ids or len(selected_issue_ids) == 0:
            return
        if new_issue.can_group_issues:
            return

        first_selected_issue = self.allowed_issue(selected_issue_ids[0])
        last_selected_issue = self.allowed_issue(selected_issue_ids[-1])

        if first_selected_issue.can_group_issues and first_selected_issue.id == last_selected_issue.id:
            # a single feature issue has been selected, so add this issue to the beginning of that feature's issue list
            # (to add to the end, the user would simply select the last issue of the expanded feature)
            new_issue.parent_group_id = first_selected_issue.id
            new_issue.save()
            last_issue_of_feature = self.allowed_issues()\
                                        .order_by_project_id(new_issue.project_id)\
                                        .filter(parent_group_id=first_selected_issue.id).first()
            SprintIssueOrder.insert_after(new_issue, last_issue_of_feature)

        elif first_selected_issue.parent_group_id == last_selected_issue.parent_group_id:
            # all selected issues belong to the same feature, so add this issue to that same feature
            new_issue.parent_group_id = last_selected_issue.parent_group_id
            new_issue.save()



    @list_route(methods=['POST'])
    def bulk_create_issues(self, request):
        try:
            params = request.data
            sprint_id = params['sprint_id']
            bulk_issue_text = params['bulk_issue_text']
            sprint = self.allowed_sprint(sprint_id)
            if not self.logged_in_permissions(sprint.business).has_add_issue:
                raise Exception("Can't add issues")
            new_issues = BulkTextParser(request.user).create_issues(raw_text=bulk_issue_text, sprint=sprint)
            new_issue_ids = [ str(x.id) for x in new_issues ]
            data = {'status': 'success', 'payload': {'new_issue_ids': new_issue_ids}}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))



    def delete(self, request, pk):
        try:
            params = request.data
            data = None

            if 'item_ids' in params:
                issue_pks = params['item_ids']
            else:
                issue_pks = [pk]

            for issue_pk in issue_pks:
                issue = self.allowed_issue(issue_pk)
                if self.logged_in_permissions(issue.project.business).has_delete_issue:
                    IssueHistory.add_history(request.user, issue,
                                             "deleted", issue.id, "")
                    VisualSpecIssue.objects.filter(issue=issue).delete()
                    issue.delete()
                else:
                    data = {'status': 'failed', 'error_message': 'Permission denied to delete issues'}

            if not data:
                data = {'status': 'success', 'payload': issue_pks}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def apply_filter(self, qs, raw_filter_args):
        project_id = raw_filter_args.pop('project_id', None)
        if project_id is not None:
            raw_filter_args['sprint__project_id'] = project_id
            
        issue_any_field = raw_filter_args.pop('any_field', None)
        if issue_any_field is not None and len(issue_any_field)>1:
            qs = qs.filter(Q(subject__icontains=issue_any_field)|Q(description__icontains=issue_any_field))

        status_names = raw_filter_args.pop('status_names', None)
        if status_names:
            qs = qs.filter(status2__name__in=status_names)

        only_open = raw_filter_args.pop('is_open', None)
        if only_open:
            qs = qs.filter_open(self.request.user)\
                   .filter(project__status3__is_closed=False)

        due_now = raw_filter_args.pop('due_now', None)
        if due_now == True:
            qs = qs.filter(due_date__date__lte=timezone.now().date(),
                           project__status3__is_closed=False,
                           project__business__archived=False)\
                   .order_by("-project__business_id", "-project_id")
        elif due_now == False:
            qs = qs.filter(Q(due_date__isnull=True) | ~Q(due_date__date=timezone.now().date()),
                           project__status3__is_closed=False,
                           project__business__archived=False)\
                   .order_by("-project__business_id", "-project_id")
            

        assigned_to_ids = raw_filter_args.pop('assigned_to_ids', None)
        if assigned_to_ids:
            qs = qs.filter(assigned_to__in=assigned_to_ids)

        return super(IssueViewSet, self).apply_filter(qs=qs, raw_filter_args=raw_filter_args)

    @list_route(methods=['POST'])
    def gen_readonly_comment_link(self, request):
        try:
            params = request.data
            issue_id = params['issue_id']
            comment_id = params['comment_id']
            issue = self.allowed_issue(issue_id)
            comment = issue.comments.get(pk=comment_id)
            if not self.logged_in_permissions(issue.project.business).has_share_issues:
                raise Exception("No permission to share issues")

            self.generate_share_ref(issue)
            self.generate_share_ref(comment)

            issue = self.allowed_issue(issue_id)

            data = {'status': 'success', 'issues': []}
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @list_route(methods=['POST'])
    def add_needs_issue(self, request):
        try:
            data = {'status': "success"}
            params = request.data
            issue_id = params['issue_id']
            needs_issue_id = params['needs_issue_id']

            issue = self.allowed_issue(issue_id)
            needs_issue = self.allowed_issue(needs_issue_id)

            bp = ProjectPermissions.for_user(user=self.request.user,
                                             business=issue.project.business,
                                             auto_create=False)
            needs_bp = ProjectPermissions.for_user(user=self.request.user,
                                                   business=needs_issue.project.business,
                                                   auto_create=False)

            if not bp.has_edit_issues:
                data['status'] = "soft_failure"
                data['error'] = "Insufficient permissions to edit issue %s" % issue
            elif not needs_bp.has_edit_issues:
                data['status'] = "soft_failure"
                data['error'] = "Insufficient permissions to edit issue %s" % needs_issue
            else:
                issue.needs_issues.add(needs_issue)
                issue.save()
                needs_issue.save()
                
            data['payload'] = {'issues': []}
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @list_route(methods=['POST'])
    def remove_needs_issue(self, request):
        try:
            data = {'status': "success"}
            params = request.data
            issue_id = params['issue_id']
            needs_issue_id = params['needs_issue_id']

            issue = self.allowed_issue(issue_id)
            needs_issue = self.allowed_issue(needs_issue_id)

            bp = ProjectPermissions.for_user(user=self.request.user,
                                             business=issue.project.business,
                                             auto_create=False)
            needs_bp = ProjectPermissions.for_user(user=self.request.user,
                                                   business=needs_issue.project.business,
                                                   auto_create=False)

            if not bp.has_edit_issues:
                data['status'] = "soft_failure"
                data['error'] = "Insufficient permissions to edit issue %s" % issue
            elif not needs_bp.has_edit_issues:
                data['status'] = "soft_failure"
                data['error'] = "Insufficient permissions to edit issue %s" % needs_issue
            else:
                issue.needs_issues.remove(needs_issue)
                issue.save()
                needs_issue.save()
                
            data['payload'] = {'issues': []}
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
    
    @list_route(methods=['POST'])
    def open_minutes(self, request):
        try:
            context = {}
            params = request.data
            project_id = params['project_id']
            project = Project.objects.get(pk=project_id)
            issue = self._find_most_appropriate_minutes_issues(request, project)
            issue = self._enrich_issues_qs(Issue.objects.filter(pk=issue.id)).first()
            context['item'] = IssueSerializer(issue, logged_in_user=request.user).data
            data = {'status': 'success', 'payload': context}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _find_most_appropriate_minutes_issues(self, request, project):
        Sprint.objects.get_or_create(business_id=project.id,
                                     project_type='minutes',
                                     defaults={'name':'Meeting minutes',
                                               'status3':SprintStatus.objects.get_or_create(name='pending', business_id=project.id)[0]})
        issue = Issue.objects.filter(project__business_id=project.id,
                                     issue_type="minutes",
                                     status2__name='new')\
                             .order_by("-created")\
                             .first()
        if issue is None:
            sprint = ProjectViewSet.create_inbox_sprint(project)

            issue = Issue.objects.create(
                project_id=sprint.id,   # sic
                status2 = IssueStatus.objects.get_or_create(name='new', business=sprint.business)[0],
                number=Issue.get_next_issue_number(sprint.business),
                issue_type="minutes",
                subject="Meeting minutes on %s" % timezone.now().strftime("%d %B %Y"),
                created_by=request.user,
                can_group_issues=False)

            SprintIssueOrder.insert_at_the_end(issue)
            IssueHistory.add_history(request.user, issue,
                                     "created", "", issue.number)
            IssueReview.reviewed(issue, request.user)

        return issue

        
@permission_classes(())
class IssueShareViewSet(BaseViewSet):
    """ Public non-authenticated endpoint """
    def list(self, request):

        try:
            data = {}
            params = json.loads(request.GET.get('params', '{}'))
            additional_params = params['additional_params']
            issue_share_ref = additional_params['ref']
            comment_share_ref = additional_params['comment_ref']
            issue = Issue.objects.get(share_ref=issue_share_ref)

            issue.allowed_comments = [issue.comments.get(share_ref=comment_share_ref)]
            
            if not self.can_be_shared(issue) or not self.can_be_shared(issue.allowed_comments[0]):
                data['status']='expired'
            else:
                data['status'] = 'success'
                data['payload'] = {'issues': [IssueShareSerializer(issue).data]}
            return HttpResponse(JSONRenderer().render(data))
        
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))
