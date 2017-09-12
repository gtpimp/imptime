import logging
from datetime import datetime
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
            filter = self._get_download_filter(request)
 
            if filter.get('date_from_inclusive', None):
                all_entries = all_entries.filter(start_time__gte=filter['date_from_inclusive'])
            if filter.get('date_to_inclusive', None):
                all_entries = all_entries.filter(start_time__lte=filter['date_to_inclusive'])
            if filter.get('sprint_ids', None):
                all_entries = all_entries.filter(project_id__in=filter['sprint_ids'])

            user_ids = all_entries.order_by("user_id").values("user_id").distinct().values_list('user_id', flat=True)
            times_by_user = {}
            for user_id in user_ids:
                times_by_user[user_id] = all_entries.filter(user_id=user_id).extra(select={'started_on':"date(start_time)"}).values('started_on').order_by('started_on').annotate(daily_hours=Sum('hours'))

            context['time_chart'] = { 'times_by_user': times_by_user,
                                      'project_id': project_id,
                                      'filter': filter }
                
            data = {"status": "success", "payload": context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _get_download_filter(self, request):
        raw_filter = json.loads(request.GET['params'])['filter']
        s = TimeChartFilterSerializer(data=raw_filter)
        s.is_valid(raise_exception=True)
        return s.validated_data
    
