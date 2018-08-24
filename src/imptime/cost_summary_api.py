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
