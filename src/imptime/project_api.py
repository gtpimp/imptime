import logging
from project_serializer import ProjectSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
# from timepiece.models import Business as Project
# from timepiece.models import Project as Sprint

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class ProjectViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            projects = self.allowed_projects()
            projects = self.apply_filter(qs=projects,
                                         raw_filter_args=filter_args)
            projects = self.apply_pagination(qs=projects,
                                             pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in projects.values_list(
                    'id', flat=True)]
            else:
                s = ProjectSerializer(projects,
                                      logged_in_user=self.request.user,
                                      many=True)
                projects_data = s.data
                context['projects'] = projects_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))
