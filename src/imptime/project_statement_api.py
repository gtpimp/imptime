import logging
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import detail_route
from datetime import datetime
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions, Entry, Rate
from imptime.authentication import FormTokenAuthenticated
from project_statement_serializer import ProjectStatementFilterSerializer
import csv

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ProjectStatementViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            project_id = pk

            if params:
                date_from_inclusive = params['filter']['date_from_inclusive'] or datetime.now()
                date_to_inclusive = params['filter']['date_to_inclusive'] or datetime.now()
            else:
                date_from_inclusive = datetime.now()
                date_to_inclusive = datetime.now()
            
            project_statement = self._get_data(user=request.user,
                                               project_id=project_id,
                                               date_from_inclusive=date_from_inclusive,
                                               date_to_inclusive=date_to_inclusive)

            data = {'status': 'success', 'payload': { 'project_statement': project_statement}}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['POST'])
    def download_sprint_budgets(self, request, pk):
        project_id = pk 
        filter = self._get_download_filter(request)
        data = self._get_data(user=request.user,
                              project_id=project_id,
                              date_from_inclusive=filter['date_from_inclusive'],
                              date_to_inclusive=filter['date_to_inclusive'])

        response = HttpResponse(content_type='text/csv')
        filename = "sprint_budgets_for_{project_name}_from_{date_from}_to_{date_to}_at_{now}.csv".format(
            project_name=data['project_name'],
            date_from=filter['date_from_inclusive'].strftime("%d%b%Y"),
            date_to=filter['date_to_inclusive'].strftime("%d%b%Y"),
            now=datetime.now().strftime("%d%b%Y_%H%M"))
        response['Content-Disposition'] = 'attachment; filename="%s"' % filename
        writer = csv.writer(response)
        writer.writerow(["From",filter['date_from_inclusive']])
        writer.writerow(["To",filter['date_to_inclusive']])
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
    def download_sprint_breakdown():
        return HttpResponse("Coming soon...")

    @detail_route(methods=['POST'])
    def download_issues_worked_on():
        return HttpResponse("Coming soon...")
    
    def _get_data(self, user, project_id, date_from_inclusive, date_to_inclusive):
        project = Project.objects.get(pk=project_id)
        bp = BusinessPermissions.for_user(user, project)  # sic
        if not bp.has_view_ctc_billable_rates:
            return self.error_response("No permission to view project statement")

        entries = self._get_entries(project, date_from_inclusive, date_to_inclusive)

        times_by_sprint = self._get_times_by_sprint(entries)
        self._enrich_rates_per_user(times_by_sprint)
        self._fix_keys(times_by_sprint)
        times_by_sprint = self._group_by_sprint(times_by_sprint)
        sprint_infos = self._get_sprint_infos(times_by_sprint)
        self._add_all_allowed_users(project, times_by_sprint, sprint_infos)
        users_with_time = self._remove_users_with_no_time(times_by_sprint)
        times_by_user = self._enrich_times_by_user(times_by_sprint)

        project_statement = { "project_id": project.id,
                              "project_name": project.name,
                              "users_with_time": list(users_with_time),
                              "date_from_inclusive": date_from_inclusive,
                              "date_to_inclusive": date_to_inclusive,
                              "sprint_infos": sprint_infos,
                              "times_by_sprint": times_by_sprint,
                              "times_by_user": times_by_user,
                              "issues": self._get_affected_issue_ids(entries) }
        self._enrich_totals(project_statement)
        self._enrich_with_sprint_budgets_across_time(times_by_sprint)

        return project_statement

    def _fix_keys(self, times):
        for time_per_user in times:
            time_per_user['sprint_id'] = time_per_user['issue__project_id']
            time_per_user['sprint_name'] = time_per_user['issue__project__name']
            del time_per_user['issue__project_id']

    def _group_by_sprint(self, times):
        grouped = {}
        for time_per_user in times:
            sprint_id = time_per_user['sprint_id']
            grouped.setdefault(sprint_id, { 'users': {}, 'totals': {} })
            grouped[sprint_id]['users'][time_per_user['user_id']] = time_per_user
        return grouped

    def _enrich_totals(self, project_statement):
        times_by_sprint = project_statement['times_by_sprint']
        grand_totals = { 'total_hours': 0,
                         'total_billable_cost': 0 }
        for time_by_sprint in times_by_sprint.values():
            time_by_sprint['totals']['total_hours'] = 0
            time_by_sprint['totals']['total_billable_cost'] = 0
            for user_id, time_per_user in time_by_sprint['users'].items():
                time_by_sprint['totals']['total_hours'] += time_per_user['total_hours']
                time_by_sprint['totals']['total_billable_cost'] += time_per_user['billable_cost']
            grand_totals['total_hours'] += time_by_sprint['totals']['total_hours']
            grand_totals['total_billable_cost'] += time_by_sprint['totals']['total_billable_cost']
        project_statement['grand_totals'] = grand_totals
    
    def _enrich_rates_per_user(self, times):
        for time_per_user in times:
            time_per_user['rate'] = self._get_rate(time_per_user['user_id'],
                                                   sprint_id=time_per_user['issue__project_id'])
            time_per_user['billable_cost'] = float(time_per_user['rate']) * float(time_per_user['total_hours'])

    def _get_rate(self, user_id, sprint_id):
        return Rate.full_rate_for_project(user_id=user_id, project_id=sprint_id) #sic
            
    def _get_entries(self, project, date_from_inclusive, date_to_inclusive):
        # The date filter only includes all entries ended in the time
        # period, it doesn't attempt to split entries that are longer
        # than a day.
        return Entry.objects.filter(issue__project__business=project,
                                    end_time__gte=date_from_inclusive,
                                    end_time__lte=date_to_inclusive)
            
    def _get_times_by_sprint(self, entries):
        return entries.order_by("issue__project__order", "user_id")\
                      .values('issue__project_id', 'issue__project__name', 'user_id')\
                      .annotate(total_hours=Sum('hours'))

    def _add_all_allowed_users(self, project, times_by_sprint, sprint_infos):
        for sprint_id, sprint_times in times_by_sprint.items():
            for user_id in project.allowed_user_ids:
                if user_id not in sprint_times['users'].keys():
                    sprint_times['users'][user_id] = { 'user_id': user_id,
                                                       'sprint_id': sprint_id,
                                                       'sprint_name': sprint_infos[sprint_id]['sprint_name'],
                                                       'total_hours': 0,
                                                       'billable_cost': 0,
                                                       'rate': self._get_rate(user_id, sprint_id) }
    
    def _enrich_times_by_user(self, times_by_sprint):
        times_by_user = {}
        for sprint_id, sprint_times in times_by_sprint.items():
            for user_id, user_time in sprint_times['users'].items():
                times_by_user.setdefault(user_id,
                                         { 'total_hours': 0, 'total_billable_cost': 0 })
                times_by_user[user_id]['total_hours'] += user_time['total_hours']
                times_by_user[user_id]['total_billable_cost'] += user_time['billable_cost']
        return times_by_user

    def _remove_users_with_no_time(self, times_by_sprint):
        users_with_time = set()
        for sprint_id, sprint_times in times_by_sprint.items():
            for user_id, user_time in sprint_times['users'].items():
                if user_time['total_hours'] > 0:
                    users_with_time.add(user_id)
        for sprint_id, sprint_times in times_by_sprint.items():
            for user_id, user_time in sprint_times['users'].items():
                if user_id not in users_with_time:
                    del sprint_times['users'][user_id]
        return users_with_time

    def _get_sprint_infos(self, times_by_sprint):
        sprints = Sprint.objects.filter(pk__in=times_by_sprint.keys()).values('id', 'name', 'business_id')
        return dict([ (x['id'], {'sprint_name':x['name'], 'project_id':x['business_id']}) for x in sprints ])
    
    def _enrich_with_sprint_budgets_across_time(self, times_by_sprint):
        sprints = Sprint.objects.filter(pk__in=times_by_sprint.keys())
        for sprint in sprints:
            all_entries = Entry.objects.all().filter(issue__project=sprint) #sic
            all_entries = all_entries.order_by("issue__project__order", "user_id")\
                                     .values('issue__project_id', 'user_id')\
                                     .annotate(total_hours=Sum('hours'))
            spent = sum([float(x['total_hours']) * self._get_rate(x['user_id'],
                                                                  x['issue__project_id']) for x in all_entries])
            remaining_budget = sprint.spendable_budget - spent
            times_by_sprint[sprint.id]['totals_across_time'] = { 'spendable_budget': sprint.spendable_budget,
                                                                 'budget': sprint.budget,
                                                                 'total_billable_cost': spent,
                                                                 'remaining_budget': remaining_budget }

    def _get_affected_issue_ids(self, entries):
        raw = entries.order_by("issue__project_id", "issue_id").distinct().values("issue_id", "issue__number", "issue__subject", "issue__project_id", "issue__project__name")
        fixed = [ { 'id': x['issue_id'],
                    'number': x['issue__number'],
                    'subject': x['issue__subject'],
                    'sprint_name': ['issue__project__name'],
                    'sprint_id': x['issue__project_id'] } for x in raw ]
        return fixed

    def _get_download_filter(self, request):
        raw_filter = json.loads(request.GET.keys()[0])
        s = ProjectStatementFilterSerializer(data=raw_filter)
        s.is_valid(raise_exception=True)
        return s.validated_data

    def _get_sprint_names(self, sprint_ids):
        return Sprint.objects.filter(pk__in=sprint_ids).values('name',flat=True)
