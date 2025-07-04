import logging
from sprint_serializer import SprintSerializer # change to new serializer once created
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from imptime.time_summary_calculator import TimeSummaryCalculator

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class TimeSummaryViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            context = {}
            sprint_id = pk

            calculator = TimeSummaryCalculator()
            time_summary = calculator.get_data(sprint_id=sprint_id, user=request.user)

            context["time_summary"] = time_summary
            data = {"status": "success", "payload": context}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
