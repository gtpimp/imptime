import logging
from datetime import datetime, date
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions, Entry, Rate, User
from rest_framework.decorators import detail_route
from time_chart_serializer import TimeChartFilterSerializer 
from lib import chart_helper

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class TimeChartViewSet(BaseViewSet):

    @detail_route(methods=['GET'])
    def times_per_user_for_project(self, request, pk):
        try:
            project_id = pk
            context = {}
            project = Project.objects.get(pk=project_id)

            bp = BusinessPermissions.for_user(request.user, project)
            if not bp.has_view_actual_hours:
                return self.error_response("No permission has_view_actual_hours")
            
            all_entries = Entry.objects.filter(issue__project__business=project).order_by("start_time")
            filter = self._get_download_filter(request, all_entries)
 
            all_entries = self._apply_filter(filter, all_entries)
            self._fix_filter_dates(filter, all_entries)
            
            user_ids = all_entries.order_by("user_id").values("user_id").distinct().values_list('user_id', flat=True)
            times_by_user = {}
            for user_id in user_ids:
                entries = all_entries.filter(user_id=user_id).by_day()
                times_by_user[user_id] = chart_helper.fill_empty_days(filter['date_from_inclusive'], filter['date_to_inclusive'], entries)

            context['time_chart'] = { 'times_by_user': times_by_user,
                                      'project_id': project_id,
                                      'filter': filter }
                
            data = {"status": "success", "payload": context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _get_download_filter(self, request, all_entries):
        raw_filter = json.loads(request.GET['params'])['filter']
        s = TimeChartFilterSerializer(data=raw_filter)
        s.is_valid(raise_exception=True)

        s.validated_data.setdefault('date_from_inclusive', None)
        s.validated_data.setdefault('date_to_inclusive', None)

        return s.validated_data

    def _fix_filter_dates(self, filter, entries):
        if filter['date_from_inclusive'] is None:
            first_entry = entries.order_by("start_time").first()
            if first_entry:
                filter['date_from_inclusive'] = first_entry.start_time
            else:
                filter['date_from_inclusive'] = datetime.now()
        if filter['date_to_inclusive'] is None:
            first_entry = entries.order_by("-start_time").first()
            if first_entry:
                filter['date_to_inclusive'] = first_entry.start_time
            else:
                filter['date_to_inclusive'] = datetime.now()

    def _apply_filter(self, filter, entries):
        if filter.get('date_from_inclusive', None):
            entries = entries.filter(start_time__gte=filter['date_from_inclusive'])
        if filter.get('date_to_inclusive', None):
            all_ntries = entries.filter(start_time__lte=filter['date_to_inclusive'])
        if filter.get('sprint_ids', None):
            entries = entries.filter(issue__project_id__in=filter['sprint_ids'])
        return entries
