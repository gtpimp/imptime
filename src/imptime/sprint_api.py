import logging
from sprint_serializer import SprintSerializer
import itertools
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum, FloatField, F, ExpressionWrapper
import json
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Project as Sprint
from timepiece.models import Business as Project
from timepiece.models import ProjectStatus as SprintStatus
from timepiece.models import ProjectIssueOrder as SprintIssueOrder
from timepiece.models import Issue, IssuePoints, Entry
from timepiece.models import BusinessProjectOrder as ProjectSprintOrder
from imptime.models import SprintTemplate
from rest_framework.decorators import detail_route

logger = logging.getLogger(__name__)

# Sprints are weird: They use the timepiece.Project model for legacy
# reasons. This api renames the model to Sprint in the import, but
# functions on the model will still refer to project. This is noted
# with 'sic' where it could be surprising.

@permission_classes((IsAuthenticated,))
class SprintViewSet(BaseViewSet):

    def list(self, request):

        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = self._set_default_filter(params.get('filter', {}))
            format_args = params.get('format', {})

            sprints = self.allowed_sprints()
            sprints = self.apply_filter(qs=sprints, raw_filter_args=filter_args)

            if 'project_id' in filter_args:
                sprints = sprints.order_by_business_id(business_id=filter_args['project_id'],  #sic
                                                       by_type_first=True)
            
            sprints = self.apply_pagination(qs=sprints,
                                            pagination=pagination)

            
            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in sprints.values_list(
                    'id', flat=True)]
            else:
                sprints = sprints.select_related("status3")

                sprints = sprints.annotate(num_issues=Count('issues'))
                sprints, estimates_by_sprint_id, hours_per_sprint_by_assignee = self._enrich_sprint_qs(sprints)

                s = SprintSerializer(sprints, many=True,
                                     estimates_by_sprint_id=estimates_by_sprint_id,
                                     hours_per_sprint_by_assignee=hours_per_sprint_by_assignee,
                                     logged_in_user=self.request.user)
                sprints_data = s.data
                context['sprints'] = sprints_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _enrich_sprint_qs(self, sprints):
        sprints = sprints.prefetch_related("reviews")\
                         .prefetch_related("issues__entries")

        entries = Entry.objects.filter(issue__project__in=sprints)\
                               .filter(issue__assigned_to_id=F('user_id'))\
                               .order_by("issue__project_id")\
                               .values("issue__project_id").distinct()\
                               .annotate(hours_per_sprint=Sum('hours'))

        hours_per_sprint_by_assignee = dict( [(x['issue__project_id'], x['hours_per_sprint']) for x in entries] )

        issue_points = IssuePoints.objects.filter(issue__project__in=sprints)\
                                          .filter(issue__assigned_to_id=F('user_id'))\
                                          .order_by('issue__project', 'issue_id')\
                                          .values('issue__project', 'issue_id')\
                                          .annotate(points_per_issue=Sum('points'))
        estimates_by_sprint_id = {}
        for k, v in itertools.groupby(issue_points, lambda x: x['issue__project']):
            estimates_by_sprint_id[k] = { 'num_estimated': 0,
                                          'estimated_hours': 0 }
            for estimated_issue in v:
                estimates_by_sprint_id[k]['num_estimated'] += 1
                estimates_by_sprint_id[k]['estimated_hours'] += estimated_issue['points_per_issue'] or 0

        # For this count we assume that only developer times matter,
        # and other times can be inferred.  This is logical if by
        # developer we mean 'person doing the assigned work' and other
        # time tracking roles are actually supporting that work (eg
        # management and testing).
        ASSIGNEE_TIME_TRACKING_MODE = 'developer'
        open_statuses = Issue.STATUSES_INDICATING_INCOMPLETE[ASSIGNEE_TIME_TRACKING_MODE]
        open_issue_points = issue_points.filter(issue__status2__name__in=open_statuses)
        
        for k, v in itertools.groupby(open_issue_points, lambda x: x['issue__project']):
            estimates_by_sprint_id[k]['num_open_estimated'] = 0
            estimates_by_sprint_id[k]['estimated_open_hours'] = 0
            for estimated_issue in v:
                estimates_by_sprint_id[k]['num_open_estimated'] += 1
                estimates_by_sprint_id[k]['estimated_open_hours'] += estimated_issue['points_per_issue'] or 0
                
        return sprints, estimates_by_sprint_id, hours_per_sprint_by_assignee
    
    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params['value']

            if 'sprint_ids' in params:
                sprint_pks = params['sprint_ids']
            else:
                sprint_pks = [pk]

            for sprint_pk in sprint_pks:
                sprint = self.allowed_sprint(sprint_pk)
                if field_name == 'name':
                    if self.logged_in_permissions(sprint.business).has_edit_sprint:
                        sprint.name = new_value
                elif field_name == "status_name":
                    if self.logged_in_permissions(sprint.business).has_edit_issue_states:
                        new_status = SprintStatus.objects.get_or_create(business_id=sprint.business_id, name=new_value)[0]
                        sprint.status3_id = new_status.id
                elif field_name == "sprint_type":
                    if self.logged_in_permissions(sprint.business).has_edit_sprint_type:
                        sprint.project_type = new_value
                elif field_name == 'sprint_id_after':
                    if self.logged_in_permissions(sprint.business).has_edit_sprint:
                        if new_value is None:
                            ProjectSprintOrder.insert_at_the_beginning(sprint)
                        else:
                            after_sprint = self.allowed_sprint(new_value) if new_value else None
                            ProjectSprintOrder.insert_after(sprint, set_after_this_project=after_sprint) #sic
                elif field_name == 'commission_percentage' and self.logged_in_permissions(sprint.business).has_edit_ctc_billable_rates:
                    sprint.commission_percentage = float(new_value)
                elif field_name == 'budget' and self.logged_in_permissions(sprint.business).has_edit_budget:
                    sprint.budget = float(new_value)
                elif field_name == 'ratios' and self.logged_in_permissions(sprint.business).has_edit_velocity:
                    sprint.ratio_management = float(new_value['ratio_management'])
                    sprint.ratio_testing = float(new_value['ratio_testing'])
                    sprint.ratio_scope_creep = float(new_value['ratio_scope_creep'])
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                sprint.save()
                sprint.recalc_secondary_estimates()

            data = {'status': 'success'}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['sprint']
            project_id = params['project_id']
            default_sprint_args = params.get('default_sprint_args', {})
            fixed_default_sprint_args = self._apply_business_project_switch(default_sprint_args)
            project = self.allowed_project(project_id)
            sprint_id_before = params.get('sprint_id_before', None)

            if self.logged_in_permissions(project).has_create_sprint:
                new_status = SprintStatus.objects.get_or_create(business_id=project_id, name='pending')[0]
                sprint = Sprint.objects.create(
                    business=project, #sic
                    status3=new_status,
                    code=Sprint.get_code_from_name(params['name']),
                    name=params['name'],
                    **fixed_default_sprint_args)

                if sprint_id_before is None:
                    ProjectSprintOrder.insert_at_the_end(sprint)
                else:
                    sprint_before = self.allowed_sprint(sprint_id_before)
                    if sprint_before.business_id == sprint.business_id:
                        ProjectSprintOrder.insert_after(sprint, set_after_this_project=sprint_before) #sic

                if default_sprint_args.get('sprint_type', None) == 'template':
                    sprint_template = SprintTemplate.objects.create(sprint=sprint)
                    context['sprint_template_id'] = sprint_template.id
                
                context['sprint'] = {'number': sprint.number}
                data = {'status': 'success', 'payload': context}
            else:
                data = {'status': 'failed', 'error_message': 'Permission denied to create sprint'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['POST'])
    def clone(self, request, pk):
        try:
            template_sprint_id = pk
            template_sprint = self.allowed_sprints().get(pk=template_sprint_id)
            project = template_sprint.business # sic
            if not self.logged_in_permissions(project).has_create_sprint:
                raise Exception("No permission to create a sprint")

            if template_sprint.project_type == 'template':
                new_project_type = 'checklist'
            elif template_sprint.project_type == 'regression':
                new_project_type = 'audit'
            else:
                new_project_type = 'checklist'

                
            new_status = SprintStatus.objects.get_or_create(business_id=project.id, name='pending')[0]
            new_name = template_sprint.name + " " + timezone.now().strftime('%d %B %Y')
            sprint_clone = Sprint.objects.create(
                business=template_sprint.business, #sic
                name=new_name,
                status3=new_status,
                project_type=new_project_type,
                code=Sprint.get_code_from_name(new_name))
            ProjectSprintOrder.insert_at_the_end(sprint_clone)

            sprint_template = template_sprint.templates.all().first()
            if sprint_template is None:
                sprint_template = SprintTemplate.objects.create(sprint=template_sprint)
            sprint_template.clones.add(sprint_clone)
            sprint_template.save()

            mapped_issues = {}
            for template_issue in template_sprint.issues.all().order_by_project_id(template_sprint.id):
                new_issue = template_issue.copy(self.request.user, add_suffix=False)
                new_issue.project = sprint_clone #sic
                new_issue.save()
                SprintIssueOrder.insert_at_the_end(new_issue)
                mapped_issues[template_issue] = new_issue
                
            for template_issue in mapped_issues.keys():
                if template_issue.parent_group:
                    new_issue.parent_group = mapped_issues[template_issue.parent_group]
                    new_issue.save()

            template_sprint.save()
                        
            data = {
                'status': 'success',
                'payload': { 'new_sprint_id': sprint_clone.id }
            }
            
            return HttpResponse(JSONRenderer().render(data))
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        
    def _set_default_filter(self, filter_args):
        sprint_status = filter_args.pop('sprint_status', None)
        if sprint_status == 'open':
            filter_args['status3__name__in'] = Sprint.open_states()
        return filter_args
