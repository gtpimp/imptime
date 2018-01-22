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
from timepiece.models import BusinessPermissions, Entry, Rate, Issue, IssueHistory
from django.contrib.auth.models import User
import csv
from lib import chart_helper

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class SummaryViewSet(BaseViewSet):

    NUM_DAYS_FOR_ACTIVE = 30
    NUM_DAYS_FOR_EXPIRED = 90
    
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

            #summaries = self.sort(summaries)
            summaries = self.apply_pagination(qs=summaries, pagination=pagination)

            if format_args.get('ids_only', None):
                context['ids'] = [ x['id'] for x in summaries ]
            else:
                summaries = [ self.populate_summary(request.user, self.allowed_projects(), summary) for summary in summaries ]
                context['summaries'] = summaries
                context['all_project_ids'] = list(set(list(chain.from_iterable( [x['project_ids'] for x in summaries]))))
                context['all_sprint_ids'] = list(set(list(chain.from_iterable( [x['sprint_ids'] for x in summaries]))))
                context['all_issue_ids'] = list(set(list(chain.from_iterable( [x['issue_ids'] for x in summaries]))))
                context['all_user_ids'] = list(set(list(chain.from_iterable( [x['user_ids'] for x in summaries]))))
            
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def populate_summary(self, user, projects, summary):
        d = {'id': summary['id'], 'day': summary['day']}

        entries = Entry.objects.all().filter(issue__project__business__in=projects, start_time__date=d['day'])

        d['issue_ids'] = set(entries.values_list('issue_id', flat=True).distinct())
        d['with_time_issues'] = d['issue_ids'].copy()

        new_issues = Issue.objects.all().filter(project__business__in=projects, created__date=d['day'])

        d['new_issues'] = new_issues.values_list('id', flat=True)
        d['issue_ids'].update(d['new_issues'])

        d['project_ids'] = set(entries.values_list('issue__project__business_id', flat=True).distinct())

        new_projects = Project.objects.all().filter(id__in=projects, created__date=d['day'])

        d['new_projects'] = new_projects.values_list('id', flat=True)
        d['project_ids'].update(d['new_projects'])

        d['sprint_ids'] = set(entries.values_list('issue__project_id', flat=True).distinct())

        new_sprints = Sprint.objects.all().filter(business__in=projects, created__date=d['day'])

        d['new_sprints'] = new_sprints.values_list('id', flat=True)
        d['sprint_ids'].update(d['new_sprints'])

        d['user_ids'] = entries.values_list('user_id', flat=True).distinct()

        return d

