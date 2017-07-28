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

    def retrieve(self, request, pk):
        try:
            sprint_id = pk
            context = {}
            sprint = Sprint.objects.get(pk=sprint_id)
            bp = BusinessPermissions.for_user(request.user, sprint.business)  # sic
            if not bp.has_view_ctc_billable_rates:
                return self.error_response("No permission to do that")

            cost_summary = sprint.calculate_new_stats(request.user)
            cost_summary['sprint_id'] = sprint.id
            context['cost_summary'] = cost_summary

            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
