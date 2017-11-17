import logging
from nudge_serializer import NudgeSerializer
from rest_framework.decorators import list_route
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from imptime.nudger import Nudger

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class NudgeViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            nudges = self.allowed_nudges()
            nudges = nudges.order_by("-created")
            nudges = self.apply_filter(qs=nudges, raw_filter_args=filter_args)
            nudges = self.apply_pagination(qs=nudges, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in nudges.values_list('id', flat=True)]
            else:
                s = NudgeSerializer(nudges, many=True)
                nudges_data = s.data
                context['nudges'] = nudges_data
            context['pagination'] = pagination
            data = {'status': 'success',
                    'payload': context,
                    'nested_objects': {
                        'project_ids': nudges.values_list('sprint__business_id', flat=True),
                        'sprint_ids': nudges.values_list('sprint_id', flat=True),
                        'issue_ids': nudges.values_list('issue_id', flat=True)
                    }
            }
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    @list_route(methods=['POST'])
    def recalculate(self, request):
        try:
            Nudger().refresh_all(user=request.user)
            data = {'status': 'success'}
            return HttpResponse(JSONRenderer().render(data))
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
