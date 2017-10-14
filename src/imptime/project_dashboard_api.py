import logging
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import detail_route
from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum, Max, Min
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions, Entry, Rate
from django.contrib.auth.models import User
import csv

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ProjectDashboardViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            projects = self.allowed_projects().order_by("name")
            projects = self.apply_filter(qs=projects, raw_filter_args=filter_args)
            projects = self.apply_pagination(qs=projects, pagination=pagination)

            if format_args.get('ids_only', None):
                context['ids'] = [str(x) for x in projects.values_list(
                    'id', flat=True)]
            else:
                project_dashboards = [ self.get_project_dashboard(request.user, project) for project in projects ]
                context['project_dashboards'] = project_dashboards
                
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def get_project_dashboard(self, user, project):
        d = { 'id': project.id,
              'project_id': project.id }

        bp = BusinessPermissions.for_user(user, project)  # sic
        if not bp.has_view_ctc_billable_rates:
            return d
        
        entries = Entry.objects.all().filter(issue__project__business=project)
        most_recent_entries_per_user = entries.order_by('user__username').values('user_id').annotate(Max('end_time'), Min('start_time'))
        d['most_recent_entry_per_user'] = most_recent_entries_per_user
        sprint_infos = self.get_open_sprints(entries)
        entries_for_open_sprints = entries.exclude(issue__project__status2__in=Sprint.closed_states()) #sic
        self.set_users(sprint_infos, entries_for_open_sprints)
        self.set_rates(sprint_infos, entries_for_open_sprints)
        self.set_progress(sprint_infos, entries_for_open_sprints)
        self.set_hours(sprint_infos, entries_for_open_sprints)
        d['sprint_infos'] = sprint_infos

        d['sprint_ids'] = sprint_infos.keys()
        d['user_ids'] = entries.values_list('user_id', flat=True).distinct()
        return d

    def get_open_sprints(self, entries):
        entries_for_open_sprints = entries.exclude(issue__project__status2__in=Sprint.closed_states())\
                                          .values("issue__project_id").distinct()
        d = {}
        [ d.setdefault(x['issue__project_id'], {'users':{}, 'budget':{}}) for x in entries_for_open_sprints ]
        return d
    
    def set_users(self, sprint_infos, entries_for_open_sprints):
        entries_for_open_sprints = entries_for_open_sprints.values('user_id', 'issue__project_id')\
                                                           .order_by("user__username")\
                                                           .values('issue__project_id', 'user_id')\
                                                           .distinct()
        for x in entries_for_open_sprints:
            sprint_infos[x['issue__project_id']]['users'][x['user_id']] = {}
    
    def set_rates(self, sprint_infos, entries_for_open_sprints):
        valid_rates = Rate.objects.filter(project__in=entries_for_open_sprints.values('issue__project_id'), #sic
                                          user__in=entries_for_open_sprints.values('user_id'),
                                          billable_amount__gt=0)\
                                  .values('billable_amount', 'project_id', 'user_id')
        for x in valid_rates:
            if x['user_id'] in sprint_infos[x['project_id']]['users']:
                sprint_infos[x['project_id']]['users'][x['user_id']]['rate'] = x['billable_amount']

    def set_hours(self, sprint_infos, entries_for_open_sprints):
        hours = entries_for_open_sprints.order_by("issue__project__order", "user_id")\
                                        .values('issue__project_id', 'user_id')\
                                        .annotate(total_hours=Sum('hours'))
        for x in hours:
            sprint_infos[x['issue__project_id']]['users'][x['user_id']]['hours'] = x['total_hours']
                
    def set_progress(self, sprint_infos, entries_for_open_sprints):
        open_sprints = Sprint.objects.filter(pk__in=sprint_infos.keys())
        for sprint in open_sprints:
            spendable_budget = sprint.spendable_budget
            total_billable = entries_for_open_sprints.filter(issue__project__id=sprint.id).cost_totals_for_project(sprint)['billable'] #sic
            sprint_infos[sprint.id]['budget'] = { 'spendable_budget':spendable_budget,
                                                  'total_billable': total_billable,
                                                  'budget_ratio': total_billable / (spendable_budget or 1) }
