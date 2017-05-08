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

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class IssueClockViewSet(BaseViewSet):

    def create(self, request):
        try:
            params = request.data
            issue_pk = params['issue_id']
            action = params['clock_action']
            issue = self.allowed_issue(issue_pk)

            if action == 'clock_out' or action == 'clock_in':
                open_entries = Entry.objects.all().filter(user=request.user, end_time__isnull=True).select_related('issue')
                for entry in open_entries:
                    entry.end_time = timezone.now()
                    entry.save()
                    RefreshNotifier().notify_model_update(entry.issue)
            
            if action == 'clock_in':
                Entry.objects.create(user=request.user,
                                     status='approved',
                                     source='quick_clocker',
                                     start_time=timezone.now(),
                                     end_time=None,
                                     hours=0,
                                     issue=issue)
                RefreshNotifier().notify_model_update(issue)
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))
