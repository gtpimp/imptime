import logging
from project_serializer import ProjectSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import BusinessPermissions


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
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params['value']

            if 'project_ids' in params:
                project_pks = params['project_ids']
            else:
                project_pks = [pk]

            for project_pk in project_pks:
                project = self.allowed_project(project_pk)
                if field_name == 'name':
                    project.name = new_value
                elif field_name == 'description':
                    project.description = new_value
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                project.save()
            
            data = {'status': 'success'}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['project']
            project = Project.objects.create(
                created_by=request.user,
                name=params['name'])

            BusinessPermissions.ensure_user_belongs_to_business(user=request.user,
                                                                business=project) #sic

            context['project'] = {'name': project.name}
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    
    
