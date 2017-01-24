import logging
from sprint_serializer import SprintSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Project as Sprint

logger = logging.getLogger(__name__)

# Sprints are weird: They use the timepiece.Project model for legacy
# reasons. This api renames the model to Sprint in the import, but
# functions on the model will still refer to project. This is noted
# with 'sic' where it could be surprising.

@permission_classes((IsAuthenticated,))
class SprintViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            sprints = self.allowed_sprints().order_by("order")
            sprints = self.apply_filter(qs=sprints,
                                        raw_filter_args=filter_args)
            sprints = self.apply_pagination(qs=sprints,
                                            pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in sprints.values_list(
                    'id', flat=True)]
            else:
                s = SprintSerializer(sprints, many=True)
                sprints_data = s.data
                context['sprints'] = sprints_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            sprint_before_id = pk
            sprint_after_id = params['sprint_id_after']
            sprint_before = self.allowed_sprint(sprint_before_id)
            sprint_after = self.allowed_sprint(sprint_after_id)
            sprint_before.move_after(sprint_after)
            data = {'status': 'success'}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['sprint']
            project_id = params['project_id']
            sprint_id_before = params['sprint_id_before']
            if sprint_id_before:
                sprint_before = self.allowed_sprint(sprint_id_before)
                order = sprint_before.order + 0.5
            else:
                order = 0
            project = self.allowed_project(project_id)
            sprint = Sprint.objects.create(
                business=project, #sic
                order=order,
                status2='pending',
                code=Sprint.get_code_from_name(params['title']),
                name=params['title'])
            sprint.renumber_project_order()
            s = SprintSerializer(sprint)
            sprint_data = s.data
            context['sprint'] = sprint_data
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    
