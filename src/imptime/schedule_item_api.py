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
from schedule_item_serializer import ScheduleItemSerializer

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
                context['schedule_items'] = schedule_items_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
