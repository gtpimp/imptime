import logging
from dateutil.relativedelta import relativedelta
from itertools import chain
from collections import OrderedDict
from datetime import datetime, date, timedelta
from django.utils import timezone
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions, Entry, User, Holiday, CalendarEvent
from rest_framework.decorators import detail_route, list_route
from time_chart_serializer import TimeChartFilterSerializer 
from lib import chart_helper

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class TimeChartViewSet(BaseViewSet):

    NUM_DAYS_FOR_ACTIVE_USER = 60
    NUM_DAYS_FOR_TIMESHEET_DASHBOARD = 30
    DAILY_WORK_HOURS_WARNING_THRESHOLD = 0.9375
    
    @list_route(methods=['GET'])
    def user_timesheet(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            project_id = filter_args.pop('project_id', None)

            users = self.allowed_users().order_by("username")
            users = self.get_active_users(users)

            # We don't have a global permission for user lists yet, so
            # for the moment only super users can view all user
            # timesheets.
            if not request.user.is_superuser:
                users = [request.user]
            else:
                if project_id:
                    users = users.filter(business_permissions__business_id=project_id).distinct() #sic
                users = self.apply_filter(qs=users, raw_filter_args=filter_args)
                users = self.apply_pagination(qs=users, pagination=pagination)

            if format_args.get('ids_only'):
                if not request.user.is_superuser:
                    context['ids'] = [str(request.user.id)]
                else:
                    context['ids'] = [str(x) for x in users.values_list('id', flat=True)]
            else:
                times_by_user = self.get_user_times(users)
                context['user_timesheets'] = times_by_user
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))
    
    @detail_route(methods=['GET'])
    def times_per_user_for_project(self, request, pk):
        try:
            project_id = pk
            context = {}
            project = Project.objects.get(pk=project_id)

            bp = BusinessPermissions.for_user(request.user, project)
            if not bp.has_view_actual_hours:
                return self.error_response("No permission has_view_actual_hours")
            
            all_entries = Entry.objects.filter(issue__project__business=project).order_by("start_time")
            filter = self._get_download_filter(request, all_entries)
 
            all_entries = self._apply_filter(filter, all_entries)
            self._fix_filter_dates(filter, all_entries)
            
            user_ids = all_entries.order_by("user_id").values("user_id").distinct().values_list('user_id', flat=True)
            times_by_user = {}
            for user_id in user_ids:
                entries = all_entries.filter(user_id=user_id).by_day()
                times_by_user[user_id] = chart_helper.fill_empty_days(filter['date_from_inclusive'], filter['date_to_inclusive'], entries)

            context['time_chart'] = { 'times_by_user': times_by_user,
                                      'filter': filter }
            context['project_id'] = project_id
            data = {"status": "success", "payload": context}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _get_download_filter(self, request, all_entries):
        raw_filter = json.loads(request.GET['params'])['filter']
        s = TimeChartFilterSerializer(data=raw_filter)
        s.is_valid(raise_exception=True)

        s.validated_data.setdefault('date_from_inclusive', None)
        s.validated_data.setdefault('date_to_inclusive', None)

        return s.validated_data

    def _fix_filter_dates(self, filter, entries):
        if filter['date_from_inclusive'] is None:
            first_entry = entries.order_by("start_time").first()
            if first_entry:
                filter['date_from_inclusive'] = first_entry.start_time
            else:
                filter['date_from_inclusive'] = datetime.now()
        if filter['date_to_inclusive'] is None:
            first_entry = entries.order_by("-start_time").first()
            if first_entry:
                filter['date_to_inclusive'] = first_entry.start_time
            else:
                filter['date_to_inclusive'] = datetime.now()

    def _apply_filter(self, filter, entries):
        if filter.get('date_from_inclusive', None):
            entries = entries.filter(start_time__gte=filter['date_from_inclusive'])
        if filter.get('date_to_inclusive', None):
            entries = entries.filter(start_time__lte=filter['date_to_inclusive'])
        if filter.get('sprint_ids', None):
            entries = entries.filter(issue__project_id__in=filter['sprint_ids'])
        return entries

    def get_active_users(self, users):
        return users.filter(is_active=True, timepiece_entries__start_time__gte=timezone.now()-relativedelta(days=self.NUM_DAYS_FOR_ACTIVE_USER))
    
    def get_user_times(self, users):
        daily_hours = {}

        to_date = timezone.now().replace(hour=0, minute=0, second=0) - relativedelta(seconds=1)
        from_date = to_date - relativedelta(days=self.NUM_DAYS_FOR_TIMESHEET_DASHBOARD) + relativedelta(seconds=2)
        all_entries = Entry.objects.filter(start_time__gte=from_date, end_time__lte=to_date)
        events_in_range = CalendarEvent.objects\
                                       .filter(start__gte=from_date, start__lte=to_date)\
                                       .values('start', 'hours')
        for user in users:

            user_entries = all_entries.filter(user=user)
            entries = user_entries.by_day()

            user_events = events_in_range.filter(user=user)

            sick_days = user_events.filter(event_type='sickday')
            leave_days = user_events.filter(event_type='leave')
            office_closed = user_events.filter(event_type='office_closed')
            public_holidays = Holiday.objects.filter(applies_on__gte=from_date, applies_on__lte=to_date)
            
            daily_hours[user.id] = {'worked': chart_helper.fill_empty_days(from_date, to_date, entries),
                                    'sick_days': sick_days.values('start'),
                                    'leave_days': leave_days.values('start'),
                                    'office_closed': office_closed.values('start'),
                                    'public_holidays': public_holidays.values('applies_on')
            }

            daily_hours[user.id]['required_daily_work_hours'] = (user.profile.required_daily_work_hours or 8)
            merged_hours = daily_hours[user.id]['worked']

            for h in merged_hours:
                h['graph_y'] = h['daily_hours']
            
            self._merge_days(from_date, to_date, merged_hours,
                             [x.date() for x in sick_days.values_list('start', flat=True)],
                             'sick_days', daily_hours[user.id]['required_daily_work_hours'])

            self._merge_days(from_date, to_date, merged_hours,
                             [x.date() for x in leave_days.values_list('start', flat=True)],
                             'leave_days', daily_hours[user.id]['required_daily_work_hours'])

            self._merge_days(from_date, to_date, merged_hours,
                             [x.date() for x in office_closed.values_list('start', flat=True)],
                             'office_closed', daily_hours[user.id]['required_daily_work_hours'])

            self._merge_days(from_date, to_date, merged_hours,
                             public_holidays.values_list('applies_on', flat=True),
                             'public_holidays', daily_hours[user.id]['required_daily_work_hours'])

            daily_hours[user.id]['merged_hours'] = merged_hours

            allowed_off_days = list(set(list(chain(sick_days.values_list('start', flat=True),
                                                   leave_days.values_list('start', flat=True),
                                                   office_closed.values_list('start', flat=True),
                                                   public_holidays.values_list('applies_on', flat=True)))))
            
            allowed_off_days = [d.date() if isinstance(d, datetime) else d for d in allowed_off_days ]
            daygenerator = ((from_date + timedelta(x)).date() for x in xrange((to_date - from_date).days+1))

            if user.username == 'michael':
                ds = []
                x = [(from_date + timedelta(x)).date() for x in xrange((to_date - from_date).days+1)]
                for d in x:
                    if d.weekday() in [5,6] or d in allowed_off_days: 
                        ds.append(d)
                    
            num_days_off = sum(1 for day in daygenerator if day.weekday() in [5,6] or day in allowed_off_days)

            daily_hours[user.id]['required_daily_work_hours_warning_threshold'] = daily_hours[user.id]['required_daily_work_hours'] * self.DAILY_WORK_HOURS_WARNING_THRESHOLD
            total_days_worked = (user_entries.aggregate(total_hours=Sum('hours'))['total_hours'] or 0) / daily_hours[user.id]['required_daily_work_hours']
            available_days = ((to_date-from_date).days+1-num_days_off) # to_date and from_date are inclusive, so add 1
            daily_hours[user.id]['average_hours_worked'] = (((total_days_worked or 0)/available_days) if available_days else 0) * daily_hours[user.id]['required_daily_work_hours']
            daily_hours[user.id]['user_id'] = user.id
            daily_hours[user.id]['id'] = user.id

        return daily_hours
 
    def _merge_days(self, from_date, to_date, primary_hours, secondary_hours, secondary_y_label, required_daily_work_hours,
                    primary_x_label="started_on", graph_y_label="graph_y",
                    primary_y_label="daily_hours"):
        for primary_hour in primary_hours:
            d = primary_hour[primary_x_label]
            if isinstance(primary_hour[primary_x_label], datetime):
                d = primary_hour[primary_x_label].date()
            if d in list(secondary_hours):
                primary_hour[secondary_y_label] = required_daily_work_hours
                primary_hour[graph_y_label] = required_daily_work_hours
            else:
                primary_hour[secondary_y_label] = -1
