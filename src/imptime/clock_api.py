import logging
from django.utils import timezone
from impasync.refresh_notifier import RefreshNotifier
from rest_framework.decorators import detail_route
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory, Feature, Entry
from clock_entry_serializer import ClockEntrySerializer

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class ClockViewSet(BaseViewSet):

    @detail_route(methods=['POST'])
    def clockIn(self, request, pk):
        try:
            params = request.data
            project_id = params['project_id']
            sprint_id = params.get('sprint_id', None)
            issue_id = params.get('issue_id', None)
            description = params.get('description', "")
            role_name = params.get('role', None)
            
            project = self.allowed_project(project_id)
            project_role = self.allowed_project_roles(project=project).get(name=role_name)
            
            if sprint_id is None:
                sprint_id = project.get_most_recent_open_project_id() #sic
            sprint = self.allowed_sprint(sprint_id)

            if issue_id is None:
                issue = sprint.get_default_issue_for_role(project_role)
            else:
                issue = self.allowed_issue(issue_id)
            
            open_entries = Entry.objects.all().filter(user=request.user, end_time__isnull=True).select_related('issue')
            for entry in open_entries:
                entry.end_time = timezone.now()
                entry.save()
            
            entry = Entry.objects.create(user=request.user,
                                         status='approved',
                                         source='auto_clock',
                                         start_time=timezone.now(),
                                         comments=description,
                                         end_time=None,
                                         hours=0,
                                         issue=issue)

            context = {}
            context['clock_entry'] = ClockEntrySerializer(entry).data
            data = {'status': 'success', 'payload': { 'item': context }}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))
