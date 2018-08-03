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

            sprints = self.allowed_sprints()
            sprints = self.apply_filter(qs=sprints, raw_filter_args=filter_args)
            sprints = self.apply_pagination(qs=sprints, pagination=pagination)

            res = []

            for sprint in sprints:
                context = {}
                snapshot = SprintSnapshot.calculate_snapshot(sprint_id=sprint.id, user=self.request.user)
                res.append(snapshot['cost_summary'])

            context['items'] = res
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

