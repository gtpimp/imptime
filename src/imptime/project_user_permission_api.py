import logging
from project_user_permission_serializer import ProjectUserPermissionSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
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
            pups = self.apply_pagination(qs=pups, pagination=pagination)
            
            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in pups.values_list('id', flat=True)]
            else:
                s = ProjectUserPermissionSerializer(pups, many=True, logged_in_user=request.user)
                pups_data = s.data
                context['project_user_permissions'] = pups_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
