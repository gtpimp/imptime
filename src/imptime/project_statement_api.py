import logging
from sprint_serializer import SprintSerializer # change to new serializer once created
from rest_framework.renderers import JSONRenderer
from datetime import datetime
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import BusinessPermissions, Entry, Rate

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ProjectStatementViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            project_id = pk
            context = {}
            project = Project.objects.get(pk=project_id)
            bp = BusinessPermissions.for_user(request.user, project)  # sic
            if not bp.has_view_ctc_billable_rates:
                return self.error_response("No permission to view project statement")

            date_from_inclusive = params['filter']['date_from_inclusive'] or datetime.now()
            date_to_inclusive = params['filter']['date_to_inclusive'] or datetime.now()
            entries = self._get_entries(project, date_from_inclusive, date_to_inclusive)

            times_by_sprint = self._get_times_by_sprint(entries)
            self._enrich_rates_per_user(times_by_sprint)
            self._fix_keys(times_by_sprint)
            times_by_sprint = self._group_by_sprint(times_by_sprint)
            self._add_all_allowed_users(project, times_by_sprint)
            users_with_time = self._remove_users_with_no_time(times_by_sprint)
            times_by_user = self._enrich_times_by_user(times_by_sprint)
            
            project_statement = { "project_id": project.id,
                                  "users_with_time": list(users_with_time),
                                  "date_from_inclusive": date_from_inclusive,
                                  "date_to_inclusive": date_to_inclusive,
                                  "times_by_sprint": times_by_sprint,
                                  "times_by_user": times_by_user }
            self._enrich_totals(project_statement)
            
            context['project_statement'] = project_statement
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _fix_keys(self, times):
        for time_per_user in times:
            time_per_user['sprint_id'] = time_per_user['issue__project_id']
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
        rate = Rate.objects.filter(user_id=user_id, project=sprint_id).first()
        return rate.full_rate if rate else 0
            
    def _get_entries(self, project, date_from_inclusive, date_to_inclusive):
        # The date filter only includes all entries ended in the time
        # period, it doesn't attempt to split entries that are longer
        # than a day.
        return Entry.objects.filter(issue__project__business=project,
                                    end_time__gte=date_from_inclusive,
                                    end_time__lte=date_to_inclusive)
            
    def _get_times_by_sprint(self, entries):
        return entries.order_by("issue__project__order", "user_id")\
                      .values('issue__project_id', 'user_id')\
                      .annotate(total_hours=Sum('hours'))

    def _add_all_allowed_users(self, project, times_by_sprint):
        for sprint_id, sprint_times in times_by_sprint.items():
            for user_id in project.allowed_user_ids:
                if user_id not in sprint_times['users'].keys():
                    sprint_times['users'][user_id] = { 'user_id': user_id,
                                                       'sprint_id': sprint_id,
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
                    
            
        
