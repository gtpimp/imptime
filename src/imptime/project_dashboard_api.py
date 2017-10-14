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
                project_dashboards = [ self.get_project_dashboard(project) for project in projects ]
                context['project_dashboards'] = project_dashboards
                
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def get_project_dashboard(self, project):
        d = { 'id': project.id,
              'project_id': project.id }

        entries = Entry.objects.all().filter(issue__project__business=project)
        most_recent_entries_per_user = entries.order_by('user__id').values('user_id').annotate(Max('end_time'), Min('start_time'))
        d['most_recent_entry_per_user'] = most_recent_entries_per_user
        return d
