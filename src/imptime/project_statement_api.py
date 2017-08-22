import logging
from sprint_serializer import SprintSerializer # change to new serializer once created
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import BusinessPermissions

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ProjectStatementViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            project_id = pk
            context = {}
            project = Project.objects.get(pk=project_id)
            # bp = BusinessPermissions.for_user(request.user, sprint.business)  # sic
            # if not bp.has_view_ctc_billable_rates:
            #     return self.error_response("No permission to view cost summary")

            project_statement = project.project_statement(request.user)
            context['project_statement'] = project_statement

            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
