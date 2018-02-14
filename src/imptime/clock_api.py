import logging
from django.utils import timezone
from impasync.refresh_notifier import RefreshNotifier
from rest_framework.decorators import detail_route, list_route
from datetime import datetime, timedelta, time
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory, Feature, Entry, ProjectRole
from clock_entry_serializer import ClockEntrySerializer, ClockEntryUpdateSerializer

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class ClockViewSet(BaseViewSet):

    @list_route(methods=['GET'])
    def auto_clock(self, request):
        return self.list(request)
    
    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            entries = self.allowed_timesheet_entries()
            entries = entries.order_by("-start_time")
            entries = self.apply_filter(qs=entries,
                                         raw_filter_args=filter_args)
            entries = self.apply_pagination(qs=entries,
                                             pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in entries.values_list('id', flat=True)]
            else:
                s = ClockEntrySerializer(entries, many=True)
                entries_data = s.data
                context['items'] = entries_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
    
    @detail_route(methods=['POST'])
    def clockIn(self, request, pk):
        try:
            context = {}
            params = request.data
            project_id = params['project_id']
            sprint_id = params.get('sprint_id', None) or None
            issue_id = params.get('issue_id', None) or None
            description = params.get('description', None) or None
            role_name = params.get('role', None) or None

            open_entries = self.allowed_timesheet_entries().filter(end_time__isnull=True).select_related('issue')
            most_recent_entry = open_entries.order_by("-end_time").first()
            if most_recent_entry:
                description = description or most_recent_entry.comments
                role_name = role_name or (most_recent_entry.role and most_recent_entry.role.name) or "manager"
                
            project = self.allowed_project(project_id)
            project_role = self.allowed_project_roles(project=project).get(name=role_name)

            if sprint_id is None:
                sprint_id = project.get_most_recent_open_project_id(user_id=request.user.id) #sic
            sprint = self.allowed_sprint(sprint_id)

            if not sprint.can_add_dev_time():
                raise Exception("Can't create entries for locked sprints: %s" % sprint)

            if issue_id is None:
                issue = sprint.get_default_issue_for_role(project_role)
            else:
                issue = self.allowed_issue(issue_id)

            
            if most_recent_entry and \
               most_recent_entry.issue.project.business_id == project_id and \
               most_recent_entry.issue.project_id == sprint_id and \
               most_recent_entry.issue_id == issue_id and \
               most_recent_entry.role_name == role_name and \
               most_recent_entry.comments == description:
                entry = most_recent_entry

            else:
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
                                             role=ProjectRole.objects.get_or_create(business=project, name=role_name)[0],
                                             issue=issue)

            context['clock_entry'] = ClockEntrySerializer(entry).data
            data = {'status': 'success', 'payload': { 'item': context }}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['POST'])
    def clockOut(self, request, pk):
        try:
            params = request.data
            entry_id = params['entry_id']

            entry = self.allowed_timesheet_entry(entry_id)
            entry.end_time = timezone.now()
            entry.save()

            context = {}
            context['clock_entry'] = ClockEntrySerializer(entry).data

            if entry.hours == 0:
                entry.delete()
            
            data = {'status': 'success', 'payload': { 'item': context }}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['DELETE'])
    def delete(self, request, pk):
        try:
            params = request.data
            data = None

            if 'item_ids' in params:
                entry_pks = params['item_ids']
            else:
                entry_pks = [pk]

            for entry_pk in entry_pks:
                entry = self.allowed_timesheet_entry(entry_pk)

                if not entry.issue.project.can_add_dev_time(): #sic
                    raise Exception("Can't delete entries for locked sprints: %s" % entry.issue.project) #sic
                
                entry.delete()

            if not data:
                data = {'status': 'success', 'payload': entry_pks}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['PUT'])
    def adjust(self, request, pk):
        try:
            params = request.data
            
            if 'clock_ids' in params:
                entry_pks = params['clock_ids']
            else:
                entry_pks = [pk]

            s = ClockEntryUpdateSerializer(data=params)
            s.is_valid(raise_exception=True)
            validated_data = s.validated_data
                
            for entry_pk in entry_pks:
                entry = self.allowed_timesheet_entry(entry_pk)

                if not entry.issue.project.can_add_dev_time(): #sic
                    raise Exception("Can't delete entries for locked sprints: %s" % entry.issue.project) #sic
                
                entry.role = ProjectRole.objects.get_or_create(business=entry.issue.project.business,
                                                               name=params['role_name'])[0]
                entry.start_time = validated_data['start_time']
                entry.end_time = validated_data['end_time']
                entry.comments = params['description']
                entry.save()
                
            data = {'status': 'success', 'payload': entry_pks}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
