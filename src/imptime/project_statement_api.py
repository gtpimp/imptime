import logging
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import detail_route
from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.http import HttpResponse
from lib import file_helper
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions, Entry, Rate
from django.contrib.auth.models import User
from imptime.authentication import FormTokenAuthenticated
from project_statement_serializer import ProjectStatementFilterSerializer
import csv
from project_statement_calculator import ProjectStatementCalculator

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ProjectStatementViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            project_id = pk

            default_from_date = datetime.now()-relativedelta(years=50)
            default_to_date = datetime.now()+relativedelta(years=50)
            if params:
                date_from_inclusive = params['filter'].get('date_from_inclusive', default_from_date)
                date_to_inclusive = params['filter'].get('date_to_inclusive', default_to_date)
                sprint_ids = params['filter'].setdefault('sprint_ids', None)
            else:
                date_from_inclusive = default_from_date
                date_to_inclusive = default_to_date
                sprint_ids = None

            calculator = ProjectStatementCalculator()
            project_statement = calculator.get_data(user=request.user,
                                                    project_id=project_id,
                                                    sprint_ids=sprint_ids,
                                                    date_from_inclusive=date_from_inclusive,
                                                    date_to_inclusive=date_to_inclusive)

            data = {'status': 'success', 'payload': { 'project_statement': project_statement}}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['POST'])
    def download_sprint_budgets(self, request, pk):
        response, writer, data = self._prepare_csv(request, pk, "sprint_budgets")

        writer.writerow(["Sprint budgets (for sprints worked on in the selected period)"])
        writer.writerow([])
        writer.writerow(["","Total budget", "Total spendable budget", "Remaining budget", "Spent"])

        for sprint_id, times_for_sprint in data['times_by_sprint'].items():
            writer.writerow([data['sprint_infos'][sprint_id]['sprint_name'],
                             times_for_sprint['totals_across_time']['budget'],
                             times_for_sprint['totals_across_time']['spendable_budget'],
                             times_for_sprint['totals_across_time']['remaining_budget'],
                             times_for_sprint['totals_across_time']['total_billable_cost']])

        return response

    @detail_route(methods=['POST'])
    def download_sprint_breakdown(self, request, pk):
        response, writer, data = self._prepare_csv(request, pk, "sprint_breakdown")

        writer.writerow(["Sprint breakdown by user (during selected period)"])
        writer.writerow([])

        row = ['',]
        for user_id in data['users_with_time']:
            row.extend([data['user_infos'][user_id]['username'],'',''])
        writer.writerow(row)

        row = ['',]
        for user_id in data['users_with_time']:
            row.extend(['Hours', 'Rate', 'Cost'])
        writer.writerow(row)

        for sprint_id, times_for_sprint in data['times_by_sprint'].items():
            row = [data['sprint_infos'][sprint_id]['sprint_name']]
            for user_id in data['users_with_time']:
                time_for_user = times_for_sprint['users'][user_id]
                row.extend([time_for_user['total_hours'], time_for_user['rate'], time_for_user['billable_cost']])
            row.extend([times_for_sprint['totals']['total_billable_cost']])
            writer.writerow(row)

        row = ['',]
        for user_id in data['users_with_time']:
            time_for_user = data['times_by_user'][user_id]
            row.extend([time_for_user['total_hours'], '', time_for_user['total_billable_cost']])
        row.extend([data['grand_totals']['total_billable_cost']])
        writer.writerow(row)

        return response


    @detail_route(methods=['POST'])
    def download_issues_worked_on(self, request, pk):
        response, writer, data = self._prepare_csv(request, pk, "issue_worked_on")

        writer.writerow(["Issues worked on (during selected period)"])
        writer.writerow([])

        writer.writerow(['sprint_id', 'sprint_name', 'issue_number', 'subject'])

        for issue_info in data['issues']:
            writer.writerow([issue_info['sprint_id'],
                             data['sprint_infos'][issue_info['sprint_id']]['sprint_name'],
                             issue_info['number'],
                             issue_info['subject']])
        return response


    def _get_download_filter(self, request):
        raw_filter = self.get_params_for_js_itempost()
        s = ProjectStatementFilterSerializer(data=raw_filter)
        s.is_valid(raise_exception=True)
        return s.validated_data

    def _prepare_csv(self, request, pk, filename_prefix):
        project_id = pk
        filter = self._get_download_filter(request)

        calculator = ProjectStatementCalculator()
        data = calculator.get_data(user=request.user,
                                   project_id=project_id,
                                   date_from_inclusive=filter['date_from_inclusive'],
                                   date_to_inclusive=filter['date_to_inclusive'],
                                   sprint_ids=filter.setdefault('sprint_ids', None))

        filename_prefix = "{prefix}_for_{project_name}_from_{date_from}_to_{date_to}".format(
            prefix=filename_prefix,
            project_name=data['project_name'],
            date_from=filter['date_from_inclusive'].strftime("%d%b%Y") if filter['date_from_inclusive'] else "all",
            date_to=filter['date_to_inclusive'].strftime("%d%b%Y") if filter['date_to_inclusive'] else "all")
        response, writer = file_helper.prepare_csv(request, filename_prefix)
        
        writer.writerow(["From",filter['date_from_inclusive']])
        writer.writerow(["To",filter['date_to_inclusive']])
        return response, writer, data

