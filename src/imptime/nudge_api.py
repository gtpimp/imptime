import logging
from nudge_serializer import NudgeSerializer
from rest_framework.decorators import list_route
import math
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from django.db.models import Count
from django.conf import settings
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
            if format_args.get('spread', None) and format_args.get('ids_only'):
                nudges = self._spread(nudges, pagination.get('page_size', settings.PAGINATION_DEFAULT_PAGINATION))
            nudges = self.apply_pagination(qs=nudges, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x.id) for x in nudges]
            else:
                s = NudgeSerializer(nudges, many=True)
                nudges_data = s.data
                context['nudges'] = nudges_data
            context['pagination'] = pagination
            data = {'status': 'success',
                    'payload': context,
                    'nested_objects': {
                        'project_ids': [x.sprint.business_id for x in nudges],
                        'sprint_ids': [x.sprint_id for x in nudges],
                        'issue_ids': [x.issue_id for x in nudges]
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
        
        
    def _spread(self, qs, page_size):
        nudge_reasons = [x['reason'] for x in qs.order_by("reason").values("reason").annotate(reasons=Count("reason"))]
        num_per_reason = math.ceil(float(page_size) / (len(nudge_reasons) or 1))
        results = []
        for nudge_reason in nudge_reasons:
            results.extend([x for x in qs.filter(reason=nudge_reason).order_by("reason")[:num_per_reason]])
        return results
