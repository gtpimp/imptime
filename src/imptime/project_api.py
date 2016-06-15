import logging
from project_serializer import ProjectSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
# from timepiece.models import Business as Project
# from timepiece.models import Project as Sprint

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class ProjectViewSet(viewsets.ViewSet):

    def list(self, request):
        try:
            context = {}
            user = request.user
            projects = user.profile.businesses.exclude_has_closed_projects()
            s = ProjectSerializer(projects, many=True)
            context['projects'] = s.data
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))
