import logging
from rest_framework.decorators import detail_route
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from imptime.models import ScheduleItem
from schedule_item_serializer import ScheduleItemSerializer, ScheduleItemCreateSerializer

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class ScheduleItemViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})
            
            schedule_items = self.allowed_schedule_items()
            schedule_items = self.apply_filter(qs=schedule_items,
                                               raw_filter_args=filter_args)
            
            if format_args.get('ids_only'):
                schedule_items = schedule_items.order_by("order", "created")

            schedule_items = self.apply_pagination(qs=schedule_items,
                                                   pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in schedule_items.values_list(
                    'id', flat=True)]
            else:
                s = ScheduleItemSerializer(schedule_items, many=True)
                schedule_items_data = s.data
                context['items'] = schedule_items_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['item']
            s = ScheduleItemCreateSerializer(data=params)
            s.is_valid(raise_exception=True)
            schedule_data = s.validated_data
            
            schedule = self.allowed_schedules_to_edit().get(pk=schedule_data['schedule_id'])
            schedule_item = ScheduleItem.objects.create(schedule=schedule,
                                                        order=0,
                                                        project_id=schedule_data.get('project_id', None),
                                                        sprint_id=schedule_data.get('sprint_id', None),
                                                        issue_id=schedule_data.get('issue_id', None),
                                                        start_at=schedule_data['start_at'],
                                                        end_at=schedule_data['end_at'])

            context['item'] = ScheduleItemSerializer(schedule_item).data
            data = {'status': 'success', 'payload': context}
            return HttpResponse(JSONRenderer().render(data))

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

    def apply_filter(self, qs, raw_filter_args):
        start_at = raw_filter_args.pop('start_at', None)
        if start_at:
            raw_filter_args['end_at__gte'] = start_at #sic
        end_at = raw_filter_args.pop('end_at', None)
        if end_at:
            raw_filter_args['start_at__lte'] = end_at #sic
        return super(ScheduleItemViewSet, self).apply_filter(qs, raw_filter_args)
    
            
        
