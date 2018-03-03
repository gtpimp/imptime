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
from timepiece.models import Issue, IssueHistory, Feature, Entry, ProjectRole, Tag, IssuePoints
from clock_entry_serializer import ClockEntrySerializer, ClockEntryUpdateSerializer

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class MultipleIssueSummaryViewSet(BaseViewSet):

    def list(self, request):

        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = {}
            additional_params = params['additional_params']

            qs = self.allowed_issues()
            qs = self.apply_filter(qs, filter_args, additional_params)

            res = {}
            res['all_user_ids'] = [x for x in qs.order_by("assigned_to_id").values_list("assigned_to_id", flat=True).distinct() if x]
            res['all_tag_ids'] = [x for x in Tag.objects.filter(issues__in=qs).order_by("id").values_list("id", flat=True).distinct() if x]

            res['estimates_by_user'] = self._get_estimates_by_user(qs)
            
            context['items'] = res
            
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    def apply_filter(self, qs, raw_filter_args, additional_filter_args):
        issue_ids = additional_filter_args.pop('issue_ids', None)
        if issue_ids:
            qs = qs.filter(pk__in=issue_ids)
        return super(MultipleIssueSummaryViewSet, self).apply_filter(qs, raw_filter_args)

    def _key_by_user_id(self, l):
        return [ {x['user_id']
    
    def _get_estimates_by_user(self, issues_qs):
        points = IssuePoints.objects.filter(issue__in=issues_qs)
        raw_estimated_hours_by_user = points.order_by("user_id").values("user_id").annotate(sum_points=Sum("points"))
        
        return { 'raw_estimated_hours_by_user': raw_estimated_hours_by_user }
