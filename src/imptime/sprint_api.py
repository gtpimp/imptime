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

            sprints = self.allowed_sprints()
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
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))
