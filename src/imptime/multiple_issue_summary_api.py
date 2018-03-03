import logging
from django.utils import timezone
from impasync.refresh_notifier import RefreshNotifier
from rest_framework.decorators import detail_route, list_route
from datetime import datetime, timedelta, time
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum, FloatField
from base_api import BaseViewSet
from django.db.models import F
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory, Feature, Entry, ProjectRole, Tag, IssuePoints, BusinessPermissions
from clock_entry_serializer import ClockEntrySerializer, ClockEntryUpdateSerializer
from timepiece.models import Business as Project

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
            summary_id = params.get('filter', {})['ids'][0]
            additional_params = params['additional_params']

            qs = self.allowed_issues()
            qs = self.apply_filter(qs, filter_args, additional_params)

            self.has_view_ctc_billable_rates = self._check_has_view_ctc_billable_rates(request, qs)
            
            res = {}
            res['all_user_ids'] = [x for x in qs.order_by("assigned_to_id").values_list("assigned_to_id", flat=True).distinct() if x]
            res['all_tag_ids'] = [x for x in Tag.objects.filter(issues__in=qs).order_by("id").values_list("id", flat=True).distinct() if x]

            res['estimates_by_user'] = self._get_estimates_by_user(qs)
            res['id'] = summary_id
            
            context['items'] = [ res ]
            
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    def _check_has_view_ctc_billable_rates(self, request, issues_qs):
        for project_id in issues_qs.values('project__business__id')\
                                   .order_by('project__business__id')\
                                   .distinct()\
                                   .values_list('project__business_id', flat=True):

            project = Project.objects.get(pk=project_id)
            bp = BusinessPermissions.for_user(request.user, project, auto_create=False)  # sic
            if not bp.has_view_ctc_billable_rates:
                return False
        return True
    
    def apply_filter(self, qs, raw_filter_args, additional_filter_args):
        issue_ids = additional_filter_args.pop('issue_ids', None)
        if issue_ids:
            qs = qs.filter(pk__in=issue_ids)
        return super(MultipleIssueSummaryViewSet, self).apply_filter(qs, raw_filter_args)

    def _get_estimates_by_user(self, issues_qs):
        estimates = {}
        points = IssuePoints.objects.filter(issue__in=issues_qs)
        raw_estimated_hours = points.order_by("user_id").values("user_id").annotate(sum_points=Sum("points"))

        for x in raw_estimated_hours:
            estimates.setdefault(x['user_id'], {})['raw_estimates'] = x['sum_points']

        estimates_with_rates=points.filter(points__gt=0, user__rates__project=F('issue__project'))\
                                   .values('user_id', 'user__rates__velocity')\
                                   .order_by('user_id')

        velocity_adjusted_hours_by_user = estimates_with_rates.annotate(velocity_adjusted_points=Sum(F('user__rates__velocity')*F('points')))

        for x in velocity_adjusted_hours_by_user:
            estimates.setdefault(x['user_id'], {})['velocity_estimates'] = x['velocity_adjusted_points']

        if self.has_view_ctc_billable_rates:

            velocity_adjusted_costs = estimates_with_rates\
                                      .annotate(velocity_adjusted_cost=Sum(F('user__rates__velocity')*F('points')*F('user__rates__billable_amount'),
                                                                           output_field=FloatField()))

            for x in velocity_adjusted_costs:
                estimates.setdefault(x['user_id'], {})['velocity_cost'] = x['velocity_adjusted_cost']

            cost_with_commission = estimates_with_rates\
                                   .annotate(velocity_adjusted_cost=Sum(F('user__rates__velocity')*F('points')*F('user__rates__billable_amount')*100/
                                                                        (100-F('user__rates__project__commission_percentage')),
                                                                         output_field=FloatField()))

            for x in cost_with_commission:
                estimates.setdefault(x['user_id'], {})['velocity_commission_cost'] = x['velocity_adjusted_cost']

        return estimates
    
