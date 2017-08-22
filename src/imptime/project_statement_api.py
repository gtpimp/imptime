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
from timepiece.models import BusinessPermissions, Rate, User

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ProjectStatementViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            project_id = pk
            context = {}
            project = Project.objects.get(pk=project_id)
            project_statement = {
                "project_id": project.id,
                "per_user": {}
            }

            bp = BusinessPermissions.for_user(request.user, project)  # sic
            if not bp.has_view_ctc_billable_rates:
                return self.error_response("No permission to view project statement")

            developers = Rate.objects.filter(project__business=project, time_tracking_mode="developer")\
                                     .values_list('user', flat=True)
            users = project.get_users_allowed_to_estimate_on_business(request.user)
            user_pks = [x.id for x in users]
            users = User.objects.filter(pk__in=user_pks).filter(pk__in=developers)

            for user in users:
                values = {
                    "test": "test"
                }

                project_statement["per_user"][user.pk] = values

            context['project_statement'] = project_statement
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
