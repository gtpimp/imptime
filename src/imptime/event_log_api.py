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
from imptime.event_log_serializer import EventLogFilterSerializer

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class EventLogViewSet(BaseViewSet):
 
    def list(self, request):

        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter = params['additional_params']['filter']
            summary_id = params['filter']['ids'][0]

            #issue_qs = self.apply_filter(issue_qs, {}, issue_filter)
            context['items'] = [ {'id':summary_id} ]
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    def apply_filter(self, qs, raw_filter_args, issue_filter):
        issue_ids = issue_filter.pop('issue_ids', None)
        if issue_ids:
            qs = qs.filter(pk__in=[x for x in issue_ids if x])
        sprint_ids = issue_filter.pop('sprint_ids', None)
        if sprint_ids:
            qs = qs.filter(project_id__in=[x for x in sprint_ids if x])
        return super(EventLogViewSet, self).apply_filter(qs, raw_filter_args)
