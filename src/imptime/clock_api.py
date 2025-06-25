import logging
from django.utils import timezone
from impasync.refresh_notifier import RefreshNotifier
from rest_framework.decorators import detail_route, list_route
from datetime import datetime, timedelta, time
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum, Min
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory, Entry, ProjectRole
from clock_entry_serializer import ClockEntrySerializer, ClockEntryUpdateSerializer, ClockEntryCreateSerializer
from timepiece.models import BusinessPermissions as ProjectPermissions

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

            active_entries_only = filter_args.get("is_active", None)

            entries = self.allowed_timesheet_entries()
            entries = entries.order_by("-end_time")
            entries = self.apply_filter(qs=entries,
                                         raw_filter_args=filter_args)

            if format_args.get('distinct_by_issue', False) == True:
                # This solution finds the issues matching the entries,
                # and finds the Minimum start time for each
                # issue. Then we paginate that list to get the numbers
                # manageable, and finally convert back to entries.
                # Note that we don't re-paginate on entries because
                # then page numbers will be wrong.
                early_issues = Issue.objects.all()\
                                            .annotate(first_clock=Min("entries__start_time"))\
                                            .filter(first_clock__isnull=False,
                                                    entries__in=entries)\
                                            .order_by("-first_clock")

                if active_entries_only == False:
                    early_issues = early_issues.exclude(entries__end_time__isnull=True)
                
                early_issues = self.apply_pagination(qs=early_issues, pagination=pagination)
                distinct_entries = self.allowed_timesheet_entries()
                distinct_entries = self.apply_filter(qs=distinct_entries,
                                                     raw_filter_args=filter_args)
                entries = distinct_entries.filter(start_time__in=[x.first_clock for x in early_issues])\
                                          .order_by("-end_time")
            else:
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
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['item']
            s = ClockEntryCreateSerializer(data=params)
            s.is_valid(raise_exception=True)
            validated_data = s.validated_data
            issue_id = validated_data['issue_id']
            start_time = validated_data['start_time']
            end_time = validated_data['end_time']
            description = validated_data.get('description', "")
            role_name = "developer"
            data = {'status': "success"}

            issue = self.allowed_issues().get(pk=issue_id)
            if not issue.project.can_add_dev_time():
                data['status'] = "soft_failure"
                data['error'] = "Can't add entries for locked sprints: %s" % issue.project.name
                
            if not self.can_set_time(issue.id, start_time) or not self.can_set_time(issue.id, end_time):
                oldest_clockable_day = Entry.get_oldest_day_for_allowed_clocking(user=request.user)
                data['status'] = "soft_failure"
                data['error'] = "Can't create an entry older than %s" % oldest_clockable_day.date()

            if data['status'] == 'success':
                role = ProjectRole.objects.get_or_create(business=issue.project.business, name=role_name)[0]
                entry = Entry.objects.create(user=request.user,
                                             status='approved',
                                             source='historic_auto_clock',
                                             start_time=start_time,
                                             end_time=end_time,
                                             comments=description or "",
                                             role=role,
                                             issue=issue)

                context['clock_entry'] = ClockEntrySerializer(entry).data
            data['payload'] = {'item': context}
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
        
    
    @detail_route(methods=['POST'])
    def clockIn(self, request, pk):
        try:
            context = {}
            params = request.data
            project_id = params.get('project_id', None) or None
            project_name = params.get('project_name', None) or None
            sprint_id = params.get('sprint_id', None) or None
            issue_id = params.get('issue_id', None) or None
            description = params.get('description', None) or None
            action_name = params.get('action', None) or None
            role_name = "developer"
            
            open_entries = self.allowed_timesheet_entries().filter(end_time__isnull=True,
                                                                   user_id=request.user.id)\
                                                           .select_related('issue')
            most_recent_entry = open_entries.order_by("-end_time").first()
            if most_recent_entry:
                description = description or most_recent_entry.comments
                role_name = role_name or (most_recent_entry.role and most_recent_entry.role.name) or "manager"

            if issue_id is not None:
                issue = self.allowed_issues().get(pk=issue_id)
                deduced_sprint_id = issue.project_id #sic
                deduced_project_id = issue.project.business_id #sic
                if sprint_id and deduced_sprint_id != sprint_id:
                    raise Exception("Issue's sprint id doesn't match the sprint")
                if project_id and deduced_project_id != project_id:
                    raise Exception("Issue's project id doesn't match the project")
                sprint_id = deduced_sprint_id
                project_id = deduced_project_id
                
            if project_id is None:
                if project_name is not None:
                    project_id = self.allowed_projects().get(name=project_name).id

            if project_id:
                project = self.allowed_project(project_id)

            if sprint_id is None and project_id is not None:
                sprint_id = project.get_most_recent_open_project_id(user_id=request.user.id) #sic
            if sprint_id:
                sprint = self.allowed_sprint(sprint_id)
                if not sprint.can_add_dev_time():
                    raise Exception("Can't create entries for locked sprints: %s" % sprint)

            if issue_id is None:
                if action_name is not None:
                    issue_type = self._resolve_issue_type_from_action(action_name)
                    issue = sprint.get_default_issue_for_type(user=request.user,
                                                              issue_type=issue_type,
                                                              subject=description[0:50],
                                                              description="(quick creation)\n"+description)
                else:
                    # This is an unallocated issue, it will need resolving before it is useful.
                    issue = None
                    sprint = None
                    project = None

            else:
                issue = self.allowed_issue(issue_id)

            for entry in open_entries:
                entry.end_time = timezone.now()
                entry.save()

            role = ProjectRole.objects.get_or_create(business=project, name=role_name)[0] if project else None

            entry = Entry.objects.create(user=request.user,
                                         status='approved',
                                         source='auto_clock',
                                         start_time=timezone.now(),
                                         comments=description or "",
                                         end_time=None,
                                         hours=0,
                                         role=role,
                                         issue=issue)
            logger.debug("Created clock entry %s" % entry)

            context['clock_entry'] = ClockEntrySerializer(entry).data
            data = {'status': 'success', 'payload': { 'item': context }}
            
        except Exception as ex:
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
            
        except Exception as ex:
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
                if entry.issue_id and not entry.issue.project.can_add_dev_time(): #sic
                    raise Exception("Can't delete entries for locked sprints: %s" % entry.issue.project) #sic
                
                entry.delete()

            if not data:
                data = {'status': 'success', 'payload': entry_pks}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['PUT'])
    def adjust(self, request, pk):
        try:
            params = request.data
            data = {'status': "success"}
            
            if 'clock_ids' in params:
                entry_pks = params['clock_ids']
            else:
                entry_pks = [pk]

            s = ClockEntryUpdateSerializer(data=params)
            s.is_valid(raise_exception=True)
            validated_data = s.validated_data
                
            for entry_pk in entry_pks:
                entry = self.allowed_timesheet_entry(entry_pk)

                can_edit = entry.user_id == request.user.id
                if not can_edit:
                    data['status'] = "soft_failure"
                    data['error'] = "Can only edit your own clock entries"
                    continue
                
                oldest_clockable_day = Entry.get_oldest_day_for_allowed_clocking(user=request.user)

                if entry.issue_id and not entry.issue.project.can_add_dev_time(): #sic
                    data['status'] = "soft_failure"
                    data['error'] = "Can't edit entries for locked sprints: %s" % entry.issue.project.name
                    continue

                if 'issue_id' in validated_data and validated_data['issue_id']:
                    issue_id = validated_data['issue_id']
                    issue = self.allowed_issues().get(pk=issue_id)

                    if not issue.project.can_add_dev_time(): #sic
                        data['status'] = "soft_failure"
                        data['error'] = "Can't move this entry into a locked sprint: %s" % issue.project.name
                        continue
                    else:
                        entry.issue = issue
                    
                if 'role_name' in validated_data and validated_data['role_name'] and entry.issue:
                    entry.role = ProjectRole.objects.get_or_create(
                        business=entry.issue.project.business,
                        name=validated_data['role_name'])[0]

                if 'start_time' in validated_data and validated_data['start_time']:
                    new_start_time = validated_data['start_time']
                    if not self.can_set_time(entry.issue_id, new_start_time):
                        data['status'] = "soft_failure"
                        data['error'] = "Can't set the end time older than %s" % oldest_clockable_day.date()
                        continue
                    else:
                        entry.start_time = new_start_time

                if 'end_time' in validated_data and validated_data['end_time']:
                    new_end_time = validated_data['end_time']
                    if not self.can_set_time(entry.issue_id, new_end_time):
                        data['status'] = "soft_failure"
                        data['error'] = "Can't set the end time older than %s" % oldest_clockable_day.date()
                        continue
                    else:
                        entry.end_time = new_end_time

                if 'description' in validated_data and validated_data['description']:
                    entry.comments = params['description'] or  ""
                    
                entry.save()

            if entry_pks:
                data['payload'] = entry_pks

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def can_set_time(self, issue_id, t):
        can_edit = t >= Entry.get_oldest_day_for_allowed_clocking(user=self.request.user)
        if not can_edit and issue_id:
            issue = Issue.objects.get(pk=issue_id)
            entry_from_bp = ProjectPermissions.for_user(user=self.request.user,
                                                        business=issue.project.business,
                                                        auto_create=False)
            can_edit = entry_from_bp.has_edit_old_clock_entries
        return can_edit
                    
    
    def apply_filter(self, qs, raw_filter_args):
        is_active = raw_filter_args.pop('is_active', None)
        if is_active is not None:
            qs = qs.filter(end_time__isnull=is_active)

        is_unallocated = raw_filter_args.pop('is_unallocated', None)
        if is_unallocated is not None:
            qs = qs.filter(issue_id__isnull=is_unallocated)
            
        return super(ClockViewSet, self).apply_filter(qs, raw_filter_args)

    def _resolve_issue_type_from_action(self, action_name):
        issue_types = Issue.MANAGEMENT_ISSUE_TYPES
        if action_name not in issue_types:
            raise Exception("Unknown action type (not found in management issue types) : %s" % action_name)
        return action_name
 
