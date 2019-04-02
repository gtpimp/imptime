import logging
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import detail_route
from datetime import datetime
from itertools import chain
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum, Max, Min
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions, Entry, Rate, Issue
from django.contrib.auth.models import User
import csv
from lib import chart_helper

logger = logging.getLogger(__name__)

NUM_DAYS_FOR_ACTIVE = 30
NUM_DAYS_FOR_EXPIRED = 90

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

            project_dashboards = []
            for project in projects:
                project_dashboards.append({'project': project,
                                           'project_id': project.id,
                                           'project_created_at': project.created,
                                           'recent_activity':get_recent_activity(project)})

            project_dashboards = self.sort(project_dashboards)
            project_dashboards = self.apply_pagination(qs=project_dashboards, pagination=pagination)
            
            if format_args.get('ids_only', None):
                context['ids'] = [x['project_id'] for x in project_dashboards]
            else:
                project_dashboards = [ self.populate_project_dashboard(request.user, project_dashboard) for project_dashboard in project_dashboards ]
                context['project_dashboards'] = project_dashboards
                context['all_project_ids'] = [x['project_id'] for x in project_dashboards]
                context['all_sprint_ids'] = list(set(list(chain.from_iterable( [x['sprint_ids'] for x in project_dashboards]))))
                context['all_user_ids'] = list(set(list(chain.from_iterable( [x['user_ids'] for x in project_dashboards]))))
            
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def populate_project_dashboard(self, user, project_dashboard):
        project = project_dashboard.pop('project')
        d = project_dashboard
        d['id'] = project.id,
        d['project_id'] = project.id,
        d['project_name'] = project.name

        bp = BusinessPermissions.for_user(user, project)  # sic
        entries = Entry.objects.all().filter(issue__project__business=project)
        sprint_infos = self.get_open_sprints(entries, project)
        if bp.has_view_ctc_billable_rates:
            most_recent_entries_per_user = entries.order_by('user_id').values('user_id').annotate(Max('end_time'), Min('start_time')).order_by('-end_time__max')
            d['most_recent_entry_per_user'] = most_recent_entries_per_user
            entries_for_open_sprints = entries.exclude(issue__project__status3__is_closed=True) #sic
            self.set_users(sprint_infos, entries_for_open_sprints)
            self.set_rates(sprint_infos, entries_for_open_sprints)
            self.set_progress(sprint_infos, entries_for_open_sprints)
            self.set_hours(sprint_infos, entries_for_open_sprints)
            
        self.set_recent_activity_chart(sprint_infos, entries)
        d['sprint_infos'] = sprint_infos
        
        d['sprint_ids'] = sprint_infos.keys()
        d['user_ids'] = entries.values_list('user_id', flat=True).distinct()
        return d

    def get_open_sprints(self, entries, project):
        open_sprints = Sprint.objects.all().filter(business_id=project.id)\
                                           .filter_open()\
                                           .values_list('id', flat=True)
        
        d = {}
        [ d.setdefault(pk, {'users':{}, 'budget':{}}) for pk in open_sprints ]
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
        hours = entries_for_open_sprints.order_by("issue__project", "user_id")\
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

    def set_recent_activity_chart(self, sprint_infos, entries):
        date_to = timezone.now()
        date_from = date_to - relativedelta(days=NUM_DAYS_FOR_ACTIVE)
        
        for sprint_id, sprint_info in sprint_infos.items():
            entries_for_sprint = entries.filter(issue__project_id=sprint_id).filter(start_time__gte=date_from, start_time__lte=date_to)
            entries_for_sprint_by_day = entries_for_sprint.by_day()
            sprint_info['recent_activity_for_all_users'] = { 'hours': chart_helper.fill_empty_days(date_from, date_to, entries_for_sprint_by_day),
                                                             'has_any_hours': entries_for_sprint.count()>0 }


    def sort(self, project_dashboards):
        return sorted(project_dashboards, key=lambda x: x['recent_activity']['sort_date'],
                      reverse=True)

def get_nonexpired_project_ids():
    projects = Project.objects.all()
    project_ids = []
    for project in projects:
        recent_activity = get_recent_activity(project)
        if recent_activity['is_active'] or recent_activity['is_inactive']:
            project_ids.append(project.id)
    return project_ids
    
def get_recent_activity(project):
    """helper method to get a list of recent activity markers for a
       project, useful for sorting, exposed for use by other apis."""
    
    entries = Entry.objects.all().filter(issue__project__business=project)
    issue = Issue.objects.filter(project__business=project)\
                         .order_by("-created")\
                         .values("id", "project_id", "project__business_id", "created", "number", "subject")\
                         .first()
    num_open_sprints = Sprint.objects.all().filter(business_id=project.id)\
                                    .filter_open().count()
    
    if issue is None:
        issue = {'id': None}
    else:
        issue['sprint_id'] = issue.pop('project_id')
        issue['project_id'] = issue.pop('project__business_id')
        if len(issue['subject'])>50:
            issue['subject'] = issue['subject'][0:47] + "..."

    entry = entries.order_by("-start_time")\
                   .values("id", "start_time", "user_id", "issue_id", "issue__number", "issue__subject", "issue__project_id", "issue__project__business_id")\
                   .first()
    if entry is None:
        entry = {'id': None}
    else:
        entry['sprint_id'] = entry.pop('issue__project_id')
        entry['project_id'] = entry.pop('issue__project__business_id')
        entry['issue_number'] = entry.pop("issue__number")
        entry['issue_subject'] = entry.pop("issue__subject")
        if len(entry['issue_subject'])>50:
            entry['issue_subject'] = entry['issue_subject'][0:47] + "..."

    most_recent_sprint_modified_dates = Sprint.objects.filter(business=project)\
                                                      .order_by("-modified")\
                                                      .values('modified', 'name')
    sprint_last_modified_at = most_recent_sprint_modified_dates[0]['modified'] if len(most_recent_sprint_modified_dates)>0 else None
    sprint_last_created_at = Sprint.objects.filter(business=project).order_by("-created").first()

    default_date = timezone.now()-relativedelta(years=10)
    sort_fields = { 'n/a': default_date,
                    'timesheet entry': entry.get('start_time', default_date),
                    'issue creation': issue.get('created', default_date),
                    'project creation': project.created or default_date,
                    'sprint creation': (sprint_last_created_at.created or default_date) if sprint_last_created_at else default_date }

    sort_reason = max(sort_fields, key=sort_fields.get)
    sort_date = sort_fields[sort_reason]

    is_active = sort_date + relativedelta(days=NUM_DAYS_FOR_ACTIVE) >= timezone.now()
    is_inactive = not is_active and sort_date + relativedelta(days=NUM_DAYS_FOR_EXPIRED) >= timezone.now()
    is_expired = not is_active and not is_inactive
    is_closed = num_open_sprints == 0
    
    d = {
        'most_recent_clock_entry': entry,
        'most_recent_issue': issue,
        'project_created_at': project.created,
        'sprint_last_modified_at': sprint_last_modified_at,
        'is_inactive': is_inactive,
        'is_expired': is_expired,
        'is_active': is_active,
        'is_closed': is_closed,
        'sort_date': sort_date,
        'sort_reason': sort_reason
    }
    
    return d
    
