import logging
from issue_serializer import IssueSerializer
from issue_attachment_serializer import IssueAttachmentSerializer
from issue_serializer import IssueGeneralDetailsSerializer
from lib import hours_helper
from imptime.bulk_text_parser import BulkTextParser
from issue_serializer import IssueWithEstimatesSerializer
from rest_framework.decorators import list_route
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory, Feature
from imptime.models import VisualSpecIssue
from timepiece.models import TagCategory, Tag, Entry, IssueStatus, IssuePoints
from timepiece.models import ProjectIssueOrder as SprintIssueOrder

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
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    def _enrich_issues_qs(self, issues):
        issues = issues.select_related('parent_group')\
                       .select_related('project__business')\
                       .select_related('assigned_to')\
                       .select_related('feature')\
                       .select_related('status2')\
                       .prefetch_related('comments')\
                       .prefetch_related('attachments')\
                       .prefetch_related('group_children')\
                       .prefetch_related('tags__category')\
                       .prefetch_related('issue_points__user')\
                       .prefetch_related('group_children')\
                       .prefetch_related(Prefetch('entries', to_attr='active_clocks',
                                                  queryset=Entry.objects.select_related('user').filter(end_time__isnull=False)))\
                       .prefetch_related(Prefetch('entries', to_attr='my_entries',
                                                  queryset=Entry.objects.filter(user=self.request.user).select_related('user')))\
                       .prefetch_related(Prefetch('issue_points', to_attr='all_estimates'))\
                       .prefetch_related(Prefetch('issue_points', to_attr='my_estimate',
                                                  queryset=IssuePoints.objects.filter(user=self.request.user, issue__in=issues)))\
                       .prefetch_related(Prefetch('issue_points__user'))\
                       .prefetch_related(Prefetch('entries', to_attr='my_clocked_in_entries',
                                                  queryset=Entry.objects.filter(user=self.request.user).select_related('user').filter(end_time__isnull=True)))
        issues = issues.annotate(actual_hours=Sum('entries__hours'))
        for issue in issues:
            for attachment in issue.attachments.all():
                attachment.react_download_url = IssueAttachmentSerializer.get_download_url(self.request, attachment)
                attachment.react_preview_url = IssueAttachmentSerializer.get_preview_url(self.request, attachment)
        return issues

    
    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params.get('value', None)

            if 'issue_ids' in params:
                issue_pks = params['issue_ids']
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
                            self.request.user, issue, "changed subject",
                            old_subject, issue.subject)
                elif field_name == "description":
                    if self.logged_in_permissions(issue.project.business).has_edit_description:
                        old_description = issue.description
                        issue.description = new_value
                        IssueHistory.add_history(
                            self.request.user, issue, "changed description",
                            old_description, issue.description)
                elif field_name == "status_name":
                    if self.logged_in_permissions(issue.project.business).has_edit_issue_states:
                        old_status = issue.status2
                        new_status = IssueStatus.objects.get_or_create(business_id=issue.project.business_id,
                                                                       name=new_value)[0]
                        issue.status2_id = new_status.id
                        IssueHistory.add_history(
                            self.request.user, issue, "changed status",
                            old_status.name if old_status else '',
                            new_status.name)
                elif field_name == "feature_name":
                    if self.logged_in_permissions(issue.project.business).has_edit_feature:
                        old_feature_name = issue.feature.name if issue.feature else "none"
                        issue.feature = Feature.objects.get_or_create(
                            business=issue.project.business, name=new_value)[0]
                        IssueHistory.add_history(
                            self.request.user, issue, "changed feature",
                            old_feature_name, issue.feature.name)
                elif field_name == 'issue_id_after':
                    if self.logged_in_permissions(issue.project.business).has_edit_issues:
                        after_issue = self.allowed_issue(new_value)
                        SprintIssueOrder.insert_after(issue, set_after_this_issue=after_issue)
                elif field_name == 'assigned_to_id':
                    if self.logged_in_permissions(issue.project.business).has_assign_user:
                        old_assigned_to = \
                            issue.assigned_to.username \
                            if issue.assigned_to else "no-one"
                        issue.assigned_to_id = new_value
                        new_assigned_to = \
                            User.objects.get(pk=new_value).username \
                            if new_value else "no-one"
                        IssueHistory.add_history(
                            self.request.user, issue, "changed assigned to",
                            old_assigned_to, new_assigned_to)
                elif field_name == 'can_group_issues':
                    if self.logged_in_permissions(issue.project.business).has_edit_issues:
                        old_can_group_issues = issue.can_group_issues
                        issue.can_group_issues = new_value
                        IssueHistory.add_history(
                            self.request.user, issue, "changed can group issues to",
                            old_can_group_issues, new_value)
                elif field_name == 'parent_group_id':
                    if self.logged_in_permissions(issue.project.business).has_edit_issues:
                        if new_value and issue.id == int(new_value):
                            logger.warning("Trying to set an issue as a parent of itself: %d" % issue.id)
                        else:
                            old_parent_group_id = issue.parent_group_id
                            issue.parent_group_id = new_value
                            IssueHistory.add_history(
                                self.request.user, issue, "changed parent group id",
                                old_parent_group_id, new_value)
                elif field_name == 'sprint_id':
                    if self.logged_in_permissions(issue.project.business).has_edit_issues:
                        old_sprint = issue.project
                        new_sprint = self.allowed_sprint(new_value)
                        issue.project = new_sprint
                        issue.save()
                        SprintIssueOrder.insert_at_the_end(issue)
                        IssueHistory.add_history(request.user, issue, "moved to sprint", unicode(old_sprint), unicode(new_sprint))
                elif field_name == "my_estimate":
                    if self.logged_in_permissions(issue.project.business).has_estimate_own_points:
                        estimate = IssuePoints.objects.get_or_create(user=request.user, issue=issue)[0]
                        old_estimate_hours = estimate.points if estimate.points is not None else "not set"
                        estimate.points = hours_helper.convert_to_decimal(new_value)
                        estimate.save()
                        IssueHistory.add_history(request.user, issue,
                                                 "changed estimate for %s" % request.user, old_estimate_hours, new_value)
                        
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                issue.save()

            data = {'status': 'success', 'payload': issue_pks}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['issue']
            sprint_id = params['sprint_id']
            issue_id_before = params.get('issue_id_before', None)

            sprint = self.allowed_sprint(sprint_id)

            def create_issue():
                issue = Issue.objects.create(
                        project_id=sprint.id,   # sic
                        status2 = IssueStatus.objects.get_or_create(name='new', business=sprint.business)[0],
                        number=Issue.get_next_issue_number(sprint.business),
                        subject=params['subject'],
                        created_by=request.user,
                        can_group_issues=params.get('can_group_issues', False))

                if issue_id_before is None:
                    SprintIssueOrder.insert_at_the_end(issue)
                else:
                    issue_before = self.allowed_issue(issue_id_before)
                    SprintIssueOrder.insert_after(issue, set_after_this_issue=issue_before)
                
                IssueHistory.add_history(self.request.user, issue,
                                             "created", "", issue.number)
                return issue

            if issue_id_before:
                issue = self.allowed_issue(issue_id_before)
                if self.logged_in_permissions(issue.project.business).has_edit_issues:
                    issue = create_issue()
                else:
                    data = {'status': 'failed', 'error_message': 'Permission denied to create issues'}
            elif not issue_id_before:
                issue = create_issue()
            else:
                data = {'status': 'failed', 'error_message': 'Failed creating issue'}

            issue = self._enrich_issues_qs(Issue.objects.filter(pk=issue.id)).first()
            context['issue'] = IssueSerializer(issue, logged_in_user=request.user).data
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        res = HttpResponse(JSONRenderer().render(data))
        return res

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

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

            
    
    def delete(self, request):
        try:
            context = {}
            params = request.data
            issue_id = params['issue_id']
            issue = self.allowed_issue(issue_id)

            if self.logged_in_permissions(issue.project.business).has_delete_issue:
                IssueHistory.add_history(self.request.user, issue,
                                         "deleted", issue.id, "")
                VisualSpecIssue.objects.filter(issue=issue).delete()
                issue.delete()
                context['issue_id'] = issue_id
                data = {'status': 'success', 'payload': context}
            else:
                data = {'status': 'failed', 'error_message': 'Permission denied to delete issues'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
