import logging
from sprint_serializer import SprintSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class SprintViewSet(viewsets.ViewSet):

    def list(self, request):
        try:
            context = {}
            user = request.user
            project_id = request.GET.get('project_id', None)
            projects = user.profile.businesses.exclude_has_closed_projects()
            project = projects.get(pk=project_id)
            sprints = Sprint.objects.filter(business_id=project.id)
            s = SprintSerializer(sprints, many=True)
            context['sprints'] = s.data
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))

    def retrieve(self, request, pk):
        try:
            context = {}
            user = request.user
            project_id = request.GET.get('project_id', None)
            projects = user.profile.businesses.exclude_has_closed_projects()
            project = projects.get(pk=project_id)
            sprints = Sprint.objects.filter(business_id=project.id)
            sprint = sprints.get(pk=pk)
            s = SprintSerializer(sprint)
            context['sprint'] = s.data
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))
