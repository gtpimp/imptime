import logging
from sprint_serializer import SprintSerializer # change to new serializer once created
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions
from timepiece.models import Issue
from multiple_issue_summary_api import MultipleIssueSummaryCalculator

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

            sprints = self.allowed_sprints()
            sprints = self.apply_filter(qs=sprints, raw_filter_args=filter_args)
            sprints = self.apply_pagination(qs=sprints, pagination=pagination)

            res = []

            for sprint in sprints:
                context = {}
                bp = BusinessPermissions.for_user(request.user, sprint.business)  # sic
                cost_summary = sprint.prepare_stats_for_json(request.user)

                issue_qs = Issue.objects.filter(project_id=sprint.id)
                cost_summary['breakdown'] = MultipleIssueSummaryCalculator(request, issue_qs=issue_qs, summary_id=sprint.id).get_data()
                cost_summary['id'] = sprint.id
                cost_summary['projections'] = self._calculate_projections(cost_summary, bp)

                if not bp.has_view_ctc_billable_rates:
                    clean_cost_summary = { 'id': cost_summary['id'],
                                           'sprint_id': cost_summary['sprint_id'],
                                           'projections': cost_summary['projections'],
                                           'progress_against_budget': cost_summary['progress_against_budget'] }
                    cost_summary = clean_cost_summary

                    
                res.append(cost_summary)

            context['items'] = res
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _calculate_projections(self, cost_summary, bp):

        projections = { 'original_dev_hours': 0,
                        'original_dev_commission_cost': 0,
                        'revised_dev_hours': 0,
                        'revised_dev_commission_cost': 0}

        for dev_user_id, dev_user_data in cost_summary['per_user'].items():
            if dev_user_data['time_tracking_mode'] != 'developer':
                continue
            projections['original_dev_hours'] += dev_user_data['adjusted_points_non_management_no_scope_creep']
            if bp.has_view_ctc_billable_rates:
                projections['original_dev_commission_cost'] += dev_user_data['adjusted_points_comparative_billable']
            
            revised_estimates_by_user = cost_summary['breakdown']['revised_estimates_by_user'].get(dev_user_id)
            if revised_estimates_by_user is None:
                continue
            projections['revised_dev_hours'] += revised_estimates_by_user['velocity_estimates']

            if bp.has_view_ctc_billable_rates:
                projections['revised_dev_commission_cost'] += revised_estimates_by_user['velocity_commission_cost']

        return projections
        
