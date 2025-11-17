import logging
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import detail_route
from datetime import datetime
from dateutil.relativedelta import relativedelta
from lib import date_helper
from django.http import HttpResponse
from lib import file_helper
from .base_api import BaseViewSet
from django.db.models import Prefetch, Count, FloatField, Sum, F, ExpressionWrapper
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions, Entry, Rate, Holiday, CalendarEvent
from timepiece.models import UserProfile
from django.contrib.auth.models import User
from imptime.authentication import FormTokenAuthenticated
from invoicing.models import Invoice
from billable_hours_statement_serializer import BillableHoursStatementFilterSerializer
import csv

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class BillableHoursStatementViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            params = request.GET.get('params', '{}')
            params = json.loads(params)

            if params:
                date_from_inclusive = params['filter']['date_from_inclusive']
                date_to_inclusive = params['filter']['date_to_inclusive']
            else:
                date_from_inclusive = datetime.now()-relativedelta(days=10)
                date_to_inclusive = datetime.now()+relativedelta(days=10)

            billable_hours_statement = self._get_data(date_from_inclusive=date_from_inclusive,
                                                      date_to_inclusive=date_to_inclusive)

            data = {'status': 'success', 'payload': { 'billable_hours_statement': billable_hours_statement}}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _get_data(self, date_from_inclusive, date_to_inclusive):
        res = {}

        projects = self.allowed_projects_for_money(self.allowed_projects())
        entries = Entry.objects.filter(issue__project__business__in=projects,
                                       end_time__gte=date_from_inclusive,
                                       end_time__lte=date_to_inclusive)
        res['by_project_and_user'] = self._get_billable_by_project_and_user(entries)
        res['by_user'] = self._get_billable_hours_by_user(date_from_inclusive, date_to_inclusive, entries)
        res['by_project'] = self._get_billable_hours_by_project(entries)
        res['totals'] = self._get_totals(entries)

        res['all_user_ids'] = [x for x in entries.values_list("user_id", flat=True).distinct() if x]
        res['all_sprint_ids'] = [x for x in entries.values_list("issue__project_id", flat=True).distinct() if x] #sic
        res['all_project_ids'] = [x for x in entries.values_list("issue__project__business_id", flat=True).distinct() if x] #sic

        res['date_from_inclusive'] = date_from_inclusive
        res['date_to_inclusive'] = date_to_inclusive
        
        return res

    def _get_totals(self, entries):
        entries = entries.filter(user__rates__project=F('issue__project'))
        entries = entries.annotate(sum_hours=Sum('hours'),
                                   cost=Sum(F('hours')*F('user__rates__billable_amount')),
                                   cost_with_commission=Sum(F('hours')*F('user__rates__billable_amount')*100/(100-F('user__rates__project__commission_percentage')),
                                                            output_field=FloatField()))

        totals = entries.aggregate(total_hours=Sum('sum_hours'),
                                   total_cost=Sum('cost'),
                                   total_cost_with_commission=Sum('cost_with_commission'))
        return [{'name': 'Totals',
                 'sum_hours': totals['total_hours'],
                 'cost': totals['total_cost'],
                 'cost_with_commission': totals['total_cost_with_commission']}]
    
    def _get_billable_by_project_and_user(self, entries):
        entries = entries.filter(user__rates__project=F('issue__project'))
        entries = entries.order_by("issue__project__business__name", "issue__project__name", "user__username")
        entries = entries.annotate(project_id=F("issue__project__business_id"),
                                   sprint_id=F("issue__project_id"))
        
        entries = entries.values("project_id", "sprint_id", "user_id")
        entries = entries.annotate(sum_hours=Sum('hours'),
                                   cost=Sum(F('hours')*F('user__rates__billable_amount')),
                                   cost_with_commission=Sum(F('hours')*F('user__rates__billable_amount')*100/(100-F('user__rates__project__commission_percentage')),
                                                            output_field=FloatField()))
        

        return entries

    def _get_billable_hours_by_user(self, date_from_inclusive, date_to_inclusive, entries):
        entries = entries.filter(user__rates__project=F('issue__project'))
        entries = entries.order_by("user__username")
        
        entries = entries.values("user_id")
        entries = entries.annotate(sum_hours=Sum('hours'),
                                   cost=Sum(F('hours')*F('user__rates__billable_amount')),
                                   cost_with_commission=Sum(F('hours')*F('user__rates__billable_amount')*100/(100-F('user__rates__project__commission_percentage')),
                                                            output_field=FloatField()))

        for entry in entries:
            entry.update(self._get_available_working_hours_for_user(date_from_inclusive, date_to_inclusive, entry['user_id']))
            entry['missing_hours'] = entry['adjusted_hours'] - entry['sum_hours']

        return entries
    
    def _get_billable_hours_by_project(self, entries):
        entries = entries.filter(user__rates__project=F('issue__project'))
        entries = entries.order_by("issue__project__business__name")
        entries = entries.annotate(project_id=F("issue__project__business_id"),
                                   sprint_id=F("issue__project_id"))
        
        entries = entries.values("project_id")
        entries = entries.annotate(sum_hours=Sum('hours'),
                                   cost=Sum(F('hours')*F('user__rates__billable_amount')),
                                   cost_with_commission=Sum(F('hours')*F('user__rates__billable_amount')*100/(100-F('user__rates__project__commission_percentage')),
                                                            output_field=FloatField()))
        

        return entries

    @detail_route(methods=['POST'])
    def download_by_user(self, request, pk):
        response, writer, data = self._prepare_csv(request, pk, "billable_hours_by_user")

        writer.writerow(["Billable hours for users in the selected period"])
        writer.writerow([])
        writer.writerow(["User",
                         "Hours (time)",
                         "Hours (decimal)",
                         "Cost",
                         "Available business days",
                         "Off days",
                         "Adjusted working days",
                         "Adjusted working hours (time)",
                         "Adjusted working hours (decimal)",
                         "Missing hours (time)",
                         "Missing hours (decimal)"])

        for row in data['by_user']:
            user = data['users_by_id'][row['user_id']]
            writer.writerow([
                "%s %s" % (user['first_name'], user['last_name']),
                date_helper.human_readable_hours(row['sum_hours']),
                row['sum_hours'],
                row['cost_with_commission'],
                row['available_business_days'],
                row['num_off_days'],
                row['adjusted_days'],
                date_helper.human_readable_hours(row['adjusted_hours']),
                row['adjusted_hours'],
                date_helper.human_readable_hours(row['missing_hours']),
                row['missing_hours']
            ])
        
        return response

    @detail_route(methods=['POST'])
    def download_by_project(self, request, pk):
        response, writer, data = self._prepare_csv(request, pk, "billable_hours_by_project")

        writer.writerow(["Billable hours for projects in the selected period"])
        writer.writerow([])
        writer.writerow(["Project", "Hours (time)", "Hours (decimal)", "Cost"])

        for row in data['by_project']:
            project = data['projects_by_id'][row['project_id']]
            writer.writerow([
                project['name'],
                date_helper.human_readable_hours(row['sum_hours']),
                row['sum_hours'],
                row['cost_with_commission']
            ])
        
        return response

    @detail_route(methods=['POST'])
    def download_by_project_and_user(self, request, pk):
        response, writer, data = self._prepare_csv(request, pk, "billable_hours_by_project_and_user")

        writer.writerow(["Billable hours for projects and users in the selected period"])
        writer.writerow([])
        writer.writerow(["Project", "Sprint", "User", "Hours (time)", "Hours (decimal)", "Cost"])

        for row in data['by_project_and_user']:
            user = data['users_by_id'][row['user_id']]
            project = data['projects_by_id'][row['project_id']]
            sprint = data['sprints_by_id'][row['sprint_id']]
            writer.writerow([
                project['name'],
                sprint['name'],
                "%s %s" % (user['first_name'], user['last_name']),
                date_helper.human_readable_hours(row['sum_hours']),
                row['sum_hours'],
                row['cost_with_commission']
            ])
        
        return response

    @detail_route(methods=['POST'])
    def download_totals(self, request, pk):
        response, writer, data = self._prepare_csv(request, pk, "billable_hours_totals")

        writer.writerow(["Billable hours totals in the selected period"])
        writer.writerow([])
        writer.writerow(["Hours (time)", "Hours (decimal)", "Cost"])

        for row in data['totals']:
            writer.writerow([
                date_helper.human_readable_hours(row['sum_hours']),
                row['sum_hours'],
                row['cost_with_commission']
            ])
        
        return response
    
    
    def _get_download_filter(self, request):
        raw_filter = json.loads(request.GET.keys()[0])
        s = BillableHoursStatementFilterSerializer(data=raw_filter)
        s.is_valid(raise_exception=True)
        return s.validated_data
    
    def _prepare_csv(self, request, pk, filename_prefix):
        filter = self._get_download_filter(request)
        data = self._get_data(date_from_inclusive=filter['date_from_inclusive'],
                              date_to_inclusive=filter['date_to_inclusive'])

        data['users_by_id'] = dict( [(x['id'], x) for x in User.objects.filter(pk__in=data['all_user_ids']).values('id', "first_name", "last_name")] )
        data['sprints_by_id'] = dict( [(x['id'], x) for x in Sprint.objects.filter(pk__in=data['all_sprint_ids']).values('id', "name")] )
        data['projects_by_id'] = dict( [(x['id'], x) for x in Project.objects.filter(pk__in=data['all_project_ids']).values('id', "name")] )
                
        filename_prefix = "{prefix}_from_{date_from}_to_{date_to}".format(
            prefix=filename_prefix,
            date_from=filter['date_from_inclusive'].strftime("%d%b%Y") if filter['date_from_inclusive'] else "all",
            date_to=filter['date_to_inclusive'].strftime("%d%b%Y") if filter['date_to_inclusive'] else "all")
        response, writer = file_helper.prepare_csv(request, filename_prefix)
        
        writer.writerow(["From",filter['date_from_inclusive']])
        writer.writerow(["To",filter['date_to_inclusive']])
        return response, writer, data
    
    def _get_available_working_hours_for_user(self, date_from_inclusive, date_to_inclusive, user_id):
        available_business_days = Holiday.business_days_in_range(date_helper.convert_iso_string_to_local_datetime(date_from_inclusive),
                                                                 date_helper.convert_iso_string_to_local_datetime(date_to_inclusive))
        num_available_business_days = len(available_business_days)
        user_profile = UserProfile.objects.get(user_id=user_id)

        off_days = CalendarEvent.objects.filter(start__gte=date_from_inclusive, start__lte=date_to_inclusive,
                                                user=user_profile.user,
                                                status__in=CalendarEvent.event_did_happen_states(),
                                                event_type__in=CalendarEvent.cant_work_event_types())

        num_off_days = off_days.count()

        adjusted_days = num_available_business_days - num_off_days
        adjusted_hours = adjusted_days * user_profile.required_daily_work_hours
        return {'available_business_days': num_available_business_days,
                'num_off_days': num_off_days,
                'adjusted_days': adjusted_days,
                'adjusted_hours': adjusted_hours}
