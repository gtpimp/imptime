import logging
from project_serializer import ProjectSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
import base_api
import json
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

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            projects = user.profile.businesses.exclude_has_closed_projects()

            projects = base_api.apply_filter(qs=projects,
                                             raw_filter_args=filter_args)
            projects = base_api.apply_pagination(qs=projects,
                                                 pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = projects.values_list('id', flat=True)
            else:
                s = ProjectSerializer(projects, many=True)
                projects_data = s.data
                context['projects'] = projects_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))

    def retrieve(self, request, pk):
        try:
            context = {}
            user = request.user
            projects = user.profile.businesses.exclude_has_closed_projects()
            project = projects.get(pk=pk)

            s = ProjectSerializer(project)
            context['project'] = s.data
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))
