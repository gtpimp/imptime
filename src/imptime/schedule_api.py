import logging
from .schedule_serializer import ScheduleSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import list_route
from rest_framework.decorators import detail_route
import math
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from django.db.models import Count
from django.conf import settings
from .base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from imptime.models import Schedule

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

            self._ensure_default_schedule_exists(request)
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
                        # 'project_ids': [x.project_id for x in schedules if x.project_id is not None],
                        # 'sprint_ids': [x.sprint_id for x in schedules if x.sprint_id is not None],
                        # 'issue_ids': [x.issue_id for x in schedules if x.issue_id is not None]
                    }
            }
            return HttpResponse(JSONRenderer().render(data))
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        

    def _ensure_default_schedule_exists(self, request):
        Schedule.get_default_schedule_for_user(request.user)

    @detail_route(methods=['POST'])
    def add_viewable_user(self, request, pk):
        try:
            schedule_id = pk
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            user_emails = request.data['user_emails']
            schedule = Schedule.objects.get(pk=schedule_id)
            if schedule.owner != request.user:
                data = {'status': 'failed', 'error_message': 'Permission denied to manage users on this schedule'}
            else:
                for user_email in user_emails:
                    schedule.viewers.add(User.objects.get(email=user_email))
                schedule.save()
                s = ScheduleSerializer(schedule)
                data = {'status': 'success',
                        'payload': {'items': [s.data]}}
            return HttpResponse(JSONRenderer().render(data))
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

    @detail_route(methods=['POST'])
    def remove_viewable_user(self, request, pk):
        try:
            schedule_id = pk
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            user_ids = request.data['user_ids']
            schedule = Schedule.objects.get(pk=schedule_id)

            if schedule.owner != request.user:
                data = {'status': 'failed', 'error_message': 'Permission denied to manage users on this schedule'}
            else:
                for user_id in user_ids:
                    schedule.viewers.remove(user_id)
                schedule.save()
                s = ScheduleSerializer(schedule)
                data = {'status': 'success',
                        'payload': {'items': [s.data]}}
            return HttpResponse(JSONRenderer().render(data))
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
    @detail_route(methods=['POST'])
    def add_editable_user(self, request, pk):
        try:
            schedule_id = pk
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            user_emails = request.data['user_emails']
            schedule = Schedule.objects.get(pk=schedule_id)
            if schedule.owner != request.user:
                data = {'status': 'failed', 'error_message': 'Permission denied to manage users on this schedule'}
            else:
                for user_email in user_emails:
                    schedule.editors.add(User.objects.get(email=user_email))
                schedule.save()
                s = ScheduleSerializer(schedule)
                data = {'status': 'success',
                        'payload': {'items': [s.data]}}
            return HttpResponse(JSONRenderer().render(data))
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

    @detail_route(methods=['POST'])
    def remove_editable_user(self, request, pk):
        try:
            schedule_id = pk
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            user_ids = request.data['user_ids']
            schedule = Schedule.objects.get(pk=schedule_id)
            if schedule.owner != request.user:
                data = {'status': 'failed', 'error_message': 'Permission denied to manage users on this schedule'}
            else:
                for user_id in user_ids:
                    schedule.editors.remove(user_id)
                schedule.save()
                s = ScheduleSerializer(schedule)
                data = {'status': 'success',
                        'payload': {'items': [s.data]}}
            return HttpResponse(JSONRenderer().render(data))
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        

        
