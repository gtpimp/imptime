import logging
from schedule_serializer import ScheduleSerializer
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
from imptime.model import Schedule

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ScheduleViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})
            ordering = params.get('ordering', {})

            self._auto_create_default_schedules()
            
            schedules = self.allowed_schedules()
            schedules = self.apply_filter(qs=schedules, raw_filter_args=filter_args)
            schedules = self.apply_ordering(qs=schedules, ordering=ordering)
            schedules = self.apply_pagination(qs=schedules, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x.id) for x in schedules]
            else:
                s = ScheduleSerializer(schedules, many=True)
                schedules_data = s.data
                context['schedules'] = schedules_data
            context['pagination'] = pagination
            data = {'status': 'success',
                    'payload': context,
                    'nested_objects': {
                        'project_ids': [x.project_id for x in schedules if x.project_id is not None],
                        'sprint_ids': [x.sprint_id for x in schedules if x.sprint_id is not None],
                        'issue_ids': [x.issue_id for x in schedules if x.issue_id is not None]
                    }
            }
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def _auto_create_default_schedules(self, request):
        Schedule.objects.get_or_create(name='my schedule', owner=request.user)
