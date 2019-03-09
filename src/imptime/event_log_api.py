import logging
from django.utils import timezone
from lib import file_helper
from impasync.refresh_notifier import RefreshNotifier
from rest_framework.decorators import detail_route, list_route
from datetime import datetime, timedelta, time
from lib.date_helper import human_readable_hours
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum, FloatField
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory, Entry, ProjectRole, Tag, IssuePoints, BusinessPermissions
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from imptime.event_log_serializer import EventLogFilterSerializer, EventLogSerializer

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class EventLogViewSet(BaseViewSet):
 
    def list(self, request):

        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            summary_id = params['filter']['ids'][0]
            filter = self._get_filter(params)

            project = self.allowed_project(pk=filter['project_id'])
            issues = Issue.objects.filter(project__business_id=project.id) #sic
            issue_histories = IssueHistory.objects.filter(original_issue_id__in=issues,
                                                          created_at__gte=filter['date_from_inclusive'],
                                                          created_at__lte=filter['date_to_inclusive'])
            clock_entries = Entry.objects.filter(issue_id__in=issues,
                                                 end_time__gte=filter['date_from_inclusive'],
                                                 start_time__lte=filter['date_to_inclusive'])

            context['items'] = EventLogSerializer([{'id': summary_id,
                                                    'issue_histories': issue_histories,
                                                    'clock_entries': clock_entries}],
                                                  many=True).data
            
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    def _get_filter(self, params):
        filter_serializer = EventLogFilterSerializer(data=params['additional_params']['filter'])
        filter_serializer.is_valid(raise_exception=True)
        return filter_serializer.data
