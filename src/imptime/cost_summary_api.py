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
                cost_summary['id'] = sprint.id

                if not bp.has_view_ctc_billable_rates:
                    clean_cost_summary = { 'sprint_id': cost_summary['sprint_id'],
                                           'progress_against_budget': cost_summary['progress_against_budget'] }
                    cost_summary = clean_cost_summary
                    
                res.append(cost_summary)

            context['items'] = res
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
