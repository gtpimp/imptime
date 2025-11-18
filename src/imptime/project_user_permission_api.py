import logging
from project_user_permission_serializer import ProjectUserPermissionSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from .base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import User
from timepiece.models import BusinessPermissions as ProjectPermissions

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ProjectUserPermissionViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            pups = self.allowed_project_permissions()
            pups = self.apply_filter(qs=pups, raw_filter_args=filter_args)

            if 'project_id' not in filter_args:
                # this is because of a limitation in the implementation
                # of allowed_project_permissions, could be fixed.
                raise Exception("Must filter by project")
            
            if pups.count() > 0:
                project = pups[0].business #sic
                if self.logged_in_permissions(project) is None or not self.logged_in_permissions(project).has_view_permissions:
                    pups = pups.none()

            if 'project_id' in filter_args and 'user_id' in filter_args and pups.count() == 0:
                # We return an empty project permission so that the caller can tell what's going on.
                pups = [ProjectPermissions(business_id=filter_args['project_id'],
                                           user_id=filter_args['user_id'],
                                           id="not_allowed")]
            else:
                pups = self.apply_pagination(qs=pups, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in pups.values_list('id', flat=True)]
            else:
                s = ProjectUserPermissionSerializer(pups, many=True)
                pups_data = s.data
                context['project_user_permissions'] = pups_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            params = request.data
            project_pk = params['project_id']
            user_pks = params['user_ids']
            permission_values = params['permission_values']

            project = self.allowed_project(project_pk)

            if self.logged_in_permissions(project) is None or not self.logged_in_permissions(project).has_edit_permissions:
                data = {'status': 'failure', 'payload': {'error_msg':'No permissions to perform this action'}}
            else:
                for user_pk in user_pks:
                    user = self.allowed_user(user_pk)
                    pup = ProjectPermissions.for_user(user, project)

                    for permission_name, value in permission_values.items():
                        pup.update_permission(permission_name, value, save=False)
                    pup.save()
                data = {'status': 'success', 'payload': {}}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
