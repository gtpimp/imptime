import logging
from rest_framework.renderers import JSONRenderer
from collections import OrderedDict
from rest_framework.decorators import detail_route
from datetime import datetime
from itertools import chain
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django.http import HttpResponse
from .base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum, Max, Min
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import Entry, Rate, Issue, IssueHistory
from timepiece.models import BusinessPermissions as ProjectPermissions
from django.contrib.auth.models import User
import csv
from lib import chart_helper
from operator import itemgetter
from itertools import groupby

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class WorkSummaryViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            now = timezone.now()
            summaries = []

            if filter_args.get('ids', None):
                ids = filter_args['ids']
            else:
                ids = range(1, 31)

            for id in ids:
                summaries.append({'id': id, 'day': (now - timezone.timedelta(days=int(id) - 1)).date()})

            summaries = self.apply_pagination(qs=summaries, pagination=pagination)

            if format_args.get('ids_only', None):
                context['ids'] = [ x['id'] for x in summaries ]
            else:
                context['all_sprint_ids'] = []
                all_project_ids = set()
                all_issue_ids = set()
                all_user_ids = set()
                summaries = [ self.populate_summary(request.user, self.allowed_projects(), summary,
                                                    all_issue_ids, all_project_ids, all_user_ids) for summary in summaries ]
                context['all_user_ids'] = list(all_user_ids)
                context['all_project_ids'] = list(all_project_ids)
                context['all_issue_ids'] = list(all_issue_ids)
                context['summaries'] = summaries
            
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _group_by_project_id(self, items, key_name):
        items_by_project_id = groupby(items, key=itemgetter("project_id"))
        d = {}
        for project_id, items in items_by_project_id:
            d[project_id] = {key_name:list(items)}
        return d
    
    def _get_issues_with_time_by_project(self, user, projects, day, all_issue_ids, all_project_ids, all_user_ids):
        entries = Entry.objects.all().filter(issue__project__business__in=projects, start_time__date=day)
        issues = entries.order_by("issue__project__business_id", "issue_id")\
                        .values('issue__project__business_id', 'issue_id').distinct()
        issues = [ {'project_id': x['issue__project__business_id'],
                    'issue_id': x['issue_id']} for x in issues ]
        all_issue_ids.update([x['issue_id'] for x in issues])
        all_project_ids.update([x['project_id'] for x in issues])
        return self._group_by_project_id(issues,
                                         key_name='issues_with_time')

    def _get_new_issues_by_project(self, user, projects, day, all_issue_ids, all_project_ids, all_user_ids):
        issues = Issue.objects.all().filter(project__business__in=projects, created__date=day)\
                                    .values("project__business_id", "id")\
                                    .order_by("project__business__id").distinct()
        issues = [ {'project_id': x['project__business_id'],
                    'issue_id': x['id']} for x in issues ]
        all_issue_ids.update([x['issue_id'] for x in issues])
        all_project_ids.update([x['project_id'] for x in issues])
        return self._group_by_project_id(issues,
                                         key_name='new_issues')

    def _get_modified_issues_by_project(self, user, projects, day, all_issue_ids, all_project_ids, all_user_ids):
        issues = Issue.objects.all().filter(project__business__in=projects, modified__date=day)\
                                    .values("project__business_id", "id")\
                                    .order_by("project__business__id").distinct()
        issues = [ {'project_id': x['project__business_id'],
                    'issue_id': x['id']} for x in issues ]
        all_issue_ids.update([x['issue_id'] for x in issues])
        all_project_ids.update([x['project_id'] for x in issues])
        return self._group_by_project_id(issues,
                                         key_name='modified_issues')
    

    def _get_work_done_by_users(self, logged_in_user, projects, day, all_issue_ids, all_project_ids, all_user_ids):

        d = OrderedDict()
        known_users = ProjectPermissions.viewable_users(logged_in_user)\
                                        .order_by('username')

        entries = Entry.objects.filter(start_time__date=day,
                                       user_id__in=known_users,
                                       issue__project__business__in=projects)
        
        hours_by_user_and_issue = entries\
                                  .order_by("user_id", "start_time")\
                                  .values("user_id", "issue_id", "issue__project_id", "issue__project__business_id")\
                                  .annotate(sum_hours=Sum('hours'))
        for hour_by_user_and_issue in hours_by_user_and_issue:
            issues = d.setdefault(hour_by_user_and_issue["user_id"], OrderedDict())\
                      .setdefault("issues", [])
            issues.append({ 'issue_id': [hour_by_user_and_issue['issue_id']],
                            'sprint_id': [hour_by_user_and_issue['issue__project_id']], #sic
                            'project_id': [hour_by_user_and_issue['issue__project__business_id']], #sic
                            'hours': hour_by_user_and_issue['sum_hours'] })
            
        all_issue_ids.update(entries.values_list("issue_id", flat=True).distinct())
        all_user_ids.update(known_users.values_list("id", flat=True).distinct())
        return d
    
    def populate_summary(self, logged_in_user, projects, summary, all_issue_ids, all_project_ids, all_user_ids):
        d = {'id': summary['id'], 'day': summary['day']}

        d['projects'] = {}
        d['projects'].update(self._get_issues_with_time_by_project(logged_in_user, projects, summary['day'], all_issue_ids, all_project_ids, all_user_ids))
        d['projects'].update(self._get_new_issues_by_project(logged_in_user, projects, summary['day'], all_issue_ids, all_project_ids, all_user_ids))
        d['projects'].update(self._get_modified_issues_by_project(logged_in_user, projects, summary['day'], all_issue_ids, all_project_ids, all_user_ids))
        d['users'] = self._get_work_done_by_users(logged_in_user, projects, summary['day'], all_issue_ids, all_project_ids, all_user_ids)

        return d

