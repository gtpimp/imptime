import logging
from sprint_serializer import SprintSerializer # change to new serializer once created
from rest_framework.renderers import JSONRenderer
from lib import file_helper
from django.utils import timezone
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
from rest_framework.decorators import list_route
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions as ProjectPermissions
from timepiece.models import Issue
from django.contrib.auth.models import User
from imptime.models import SprintSnapshot

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class CostSummaryViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {}) 

            sprints = self.allowed_sprints()
            sprints = self.apply_filter(qs=sprints, raw_filter_args=filter_args)
            sprints = self.apply_pagination(qs=sprints, pagination=pagination)

            res = []

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in sprints.values_list(
                    'id', flat=True)]
            else:
                for sprint in sprints:
                    context = {}
                    cost_summary = SprintSnapshot.calculate_cost_summary(sprint=sprint, user=self.request.user)
                    cost_summary['id'] = sprint.id
                    res.append(cost_summary)

            context['items'] = res
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def apply_filter(self, qs, raw_filter_args):
        project_id = raw_filter_args.pop('project_id', None)
        if project_id:
            qs = qs.filter(business_id=project_id) #sic
            
        sprint_status = raw_filter_args.pop('sprint_status', None)
        if sprint_status == 'open':
            qs = qs.filter(status3__name__in=Sprint.open_states())
            
        sprint_types = raw_filter_args.pop('sprint_types', None)
        if sprint_types is not None:
            qs = qs.filter(project_type__in=sprint_types)
            
        return super(CostSummaryViewSet, self).apply_filter(qs, raw_filter_args)

    @list_route(methods=['POST'])
    def download(self, request):
        params = self.get_params_for_js_itempost()
        sprint_id = params.get('sprint_id')
        if sprint_id is None:
            project_id = params['project_id']
            # TODO: complete
        sprint = self.allowed_sprints().get(pk=sprint_id)
        cost_summary = SprintSnapshot.calculate_cost_summary(sprint=sprint, user=self.request.user)

        bp = ProjectPermissions.for_user(self.request.user, sprint.business)  # sic
        if not bp.has_view_ctc_billable_rates:
            return HttpResponse("No permissions")
        
        download_format = params.get('format', 'csv')
        if download_format != 'csv':
            raise Exception("Only csv supported")

        cs = SprintSnapshot.calculate_cost_summary(sprint=sprint, user=self.request.user)
        response, writer, data = self._prepare_csv(request, cost_summary, "cost_summary_of_"+sprint.name)

        cs_totals = cs['breakdown']['totals']
        writer.writerow([sprint.name])
        writer.writerow([])
        writer.writerow(["Totals based on estimates"])
        writer.writerow(["Estimated hours", cs_totals["estimated_hours"]])
        writer.writerow(["Estimated cost", "R%.2f"%cs_totals["estimated_cost"]])
        writer.writerow(["Uncertainty percentage", cs_totals["scope_creep_percentage"]])
        writer.writerow(["Uncertainty amount", "R%.2f"%cs_totals["scope_creep"]])
        writer.writerow(["Total estimated cost", "R%.2f"%cs_totals["grand_total"]])
        writer.writerow([])

        writer.writerow(["Issues"])
        writer.writerow(["Number", "Name", "Assigned user", "Estimate by assigned user (with velocity)", "Estimated cost by assigned user"])
        for issue_estimate in cs['breakdown']['estimates_by_issue'].values():
            issue = data['issues_by_id'][issue_estimate['id']]
            assigned_user_id = issue_estimate['assigned_to_id']
            if assigned_user_id:
                assigned_user = data['users_by_id'][assigned_user_id]
                assigned_username = "%s %s" % (assigned_user['first_name'], assigned_user['last_name'])
            else:
                assigned_username = 'Unassigned'

            writer.writerow([issue['number'],
                             issue['subject'],
                             assigned_username,
                             issue_estimate['velocity_adjusted_estimate'],
                             issue_estimate['velocity_adjusted_cost']
            ])
        
        return response

    def _prepare_csv(self, request, cost_summary, filename_prefix):
        data = {}
        data['users_by_id'] = dict( [(x['id'], x) for x in User.objects.filter(pk__in=cost_summary['breakdown']['all_user_ids']).values('id', "first_name", "last_name")] )
        data['issues_by_id'] = dict( [(x['id'], x) for x in Issue.objects.filter(pk__in=cost_summary['breakdown']['all_issue_ids']).values('id', "number", "subject")] )
                             
        response, writer = file_helper.prepare_csv(request, filename_prefix)
        return response, writer, data
