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
from django.db.models import F, ExpressionWrapper
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
            issue_filter = params['additional_params']['filter']

            qs = self.allowed_issues()
            qs = self.apply_filter(qs, filter_args, issue_filter)

            self._set_permissions(request, qs)
            
            res = {}
            res['id'] = summary_id
            res['all_user_ids'] = [x for x in qs.order_by("assigned_to_id").values_list("assigned_to_id", flat=True).distinct() if x]
            res['all_tag_ids'] = [x for x in Tag.objects.filter(issues__in=qs).order_by("id").values_list("id", flat=True).distinct() if x]
            res['all_issue_ids'] = qs.values_list('id', flat=True)
            res['estimates_by_user'] = self._get_estimates_by_user(qs)
            res['estimates_by_tag_category'] = self._get_estimates_by_tag_category(qs)
            res['actuals_by_user'] = self._get_actuals_by_user(qs, res['estimates_by_user'])
            res['actuals_by_issue'] = self._get_actuals_by_issue(qs)
            res['actuals_by_issue_and_user'] = self._get_actuals_by_issue_and_user(qs)
            res['actuals_by_tag_category'] = self._get_actuals_by_tag_category(qs)
            res['velocities_by_user'] = self._get_velocities_by_user(qs, res['all_user_ids'])
            
            context['items'] = [ res ]
            
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    def _set_permissions(self, request, issues_qs):
        self.has_view_ctc_billable_rates = True
        self.has_see_other_user_points = True
        for project_id in issues_qs.values('project__business__id')\
                                   .order_by('project__business__id')\
                                   .distinct()\
                                   .values_list('project__business_id', flat=True):

            project = Project.objects.get(pk=project_id)
            bp = BusinessPermissions.for_user(request.user, project, auto_create=False)  # sic

            if not bp.has_view_ctc_billable_rates:
                self.has_view_ctc_billable_rates = False
            if not bp.has_see_other_user_points:
                self.has_see_other_user_points = False
    
    def apply_filter(self, qs, raw_filter_args, issue_filter):
        issue_ids = issue_filter.pop('issue_ids', None)
        if issue_ids:
            qs = qs.filter(pk__in=issue_ids)
        sprint_ids = issue_filter.pop('sprint_ids', None)
        if sprint_ids:
            qs = qs.filter(project_id__in=sprint_ids)
        return super(MultipleIssueSummaryViewSet, self).apply_filter(qs, raw_filter_args)

    def _get_estimates_by_user(self, issues_qs):
        estimates = {}
        points = IssuePoints.objects.filter(issue__in=issues_qs, points__gt=0)
        raw_estimated_hours = points.order_by("user_id").values("user_id").annotate(sum_points=Sum("points"))

        for x in raw_estimated_hours:
            estimates.setdefault(x['user_id'], {})['raw_estimates'] = x['sum_points']

        estimates_with_rates=points.filter(user__rates__project=F('issue__project'))\
                                   .values('user_id', 'user__rates__velocity')\
                                   .order_by('user_id')

        velocity_adjusted_hours_by_user = estimates_with_rates.annotate(velocity_adjusted_points=Sum(F('user__rates__velocity')*F('points')))

        for x in velocity_adjusted_hours_by_user:
            if self.has_see_other_user_points or x['user_id'] == self.request.user_id:
                estimates.setdefault(x['user_id'], {})['velocity_estimates'] = x['velocity_adjusted_points']
                estimates[x['user_id']]['given_velocity'] = \
                              estimates[x['user_id']]['velocity_estimates']/estimates[x['user_id']]['raw_estimates']

        if self.has_view_ctc_billable_rates:

            velocity_adjusted_costs = estimates_with_rates\
                                      .annotate(velocity_adjusted_cost=Sum(F('user__rates__velocity')*F('points')*F('user__rates__billable_amount'),
                                                                           output_field=FloatField()))

            for x in velocity_adjusted_costs:
                if self.has_see_other_user_points or x['user_id'] == self.request.user_id:
                    estimates.setdefault(x['user_id'], {})['velocity_cost'] = x['velocity_adjusted_cost']

            cost_with_commission = estimates_with_rates\
                                   .annotate(velocity_adjusted_cost=Sum(F('user__rates__velocity')*F('points')*F('user__rates__billable_amount')*100/
                                                                        (100-F('user__rates__project__commission_percentage')),
                                                                         output_field=FloatField()))

            for x in cost_with_commission:
                if self.has_see_other_user_points or x['user_id'] == self.request.user_id:
                    estimates.setdefault(x['user_id'], {})['velocity_commission_cost'] = x['velocity_adjusted_cost']

        return estimates
    
    def _get_estimates_by_tag_category(self, issues_qs):
        estimates_by_tag_category = {}

        points = IssuePoints.objects.filter(points__gt=0, issue__in=issues_qs)
        raw_estimated_hours_by_tag = points.order_by("user_id", "issue__tags__id")\
                                           .values("user_id", "issue__tags__id")\
                                           .distinct()\
                                           .annotate(sum_points=Sum("points"), category_id=F('issue__tags__category_id'))
        for x in raw_estimated_hours_by_tag:
            if self.has_see_other_user_points or x['user_id'] == self.request.user_id:
                estimates_by_tag_category.setdefault(x['category_id'], {})\
                                         .setdefault(x['user_id'], {})\
                                         .setdefault(x['issue__tags__id'], {})\
                                         ['raw_estimates'] = x['sum_points']

        estimates_with_rates_by_tag=points.filter(user__rates__project=F('issue__project'))\
                                          .values('user_id', "issue__tags__id", 'user__rates__velocity')\
                                          .order_by('user_id', "issue__tags__id")\
                                          .distinct()

        velocity_adjusted_hours_by_user_and_tag = estimates_with_rates_by_tag\
                                                  .annotate(velocity_adjusted_points=Sum(F("user__rates__velocity")*F("points")),
                                                            category_id=F('issue__tags__category_id'))
        for x in velocity_adjusted_hours_by_user_and_tag:
            if self.has_see_other_user_points or x['user_id'] == self.request.user_id:
                estimates_by_tag_category.setdefault(x['category_id'], {})\
                                         .setdefault(x['user_id'], {})\
                                         .setdefault(x['issue__tags__id'], {})\
                                         ['velocity_estimates'] = x['velocity_adjusted_points']
                estimates_by_tag_category[x['category_id']][x['user_id']][x['issue__tags__id']]['given_velocity'] = \
                    estimates_by_tag_category[x['category_id']][x['user_id']][x['issue__tags__id']]['velocity_estimates'] /\
                    estimates_by_tag_category[x['category_id']][x['user_id']][x['issue__tags__id']]['raw_estimates']

        if self.has_view_ctc_billable_rates:
            velocity_adjusted_costs = estimates_with_rates_by_tag\
                                      .annotate(velocity_adjusted_cost=Sum(F('user__rates__velocity')*F('points')*F('user__rates__billable_amount'),
                                                                           output_field=FloatField()),
                                                category_id=F('issue__tags__category_id'))
            for x in velocity_adjusted_costs:
                if self.has_see_other_user_points or x['user_id'] == self.request.user_id:
                    estimates_by_tag_category.setdefault(x['category_id'], {})\
                                             .setdefault(x['user_id'], {})\
                                             .setdefault(x['issue__tags__id'], {})\
                                             ['velocity_cost'] = x['velocity_adjusted_cost']

            costs_with_commission = estimates_with_rates_by_tag\
                                    .annotate(velocity_adjusted_cost=Sum(F('user__rates__velocity')*F('points')*F('user__rates__billable_amount')*100/
                                                                        (100-F('user__rates__project__commission_percentage')),
                                                                         output_field=FloatField()),
                                              category_id=F('issue__tags__category_id'))
            for x in costs_with_commission:
                if self.has_see_other_user_points or x['user_id'] == self.request.user_id:
                    estimates_by_tag_category.setdefault(x['category_id'], {})\
                                             .setdefault(x['user_id'], {})\
                                             .setdefault(x['issue__tags__id'], {})\
                                             ['velocity_commission_cost'] = x['velocity_adjusted_cost']
                
            
        return estimates_by_tag_category

    def _get_actuals_enriched_with_costs(self, entries):
        return entries.annotate(sum_hours=Sum('hours'),
                                rate_with_commission=ExpressionWrapper(F('user__rates__billable_amount')*100/(100-F('user__rates__project__commission_percentage')), output_field=FloatField()),
                                cost=Sum(F('hours')*F('user__rates__billable_amount')),
                                cost_with_commission=Sum(F('hours')*F('user__rates__billable_amount')*100/(100-F('user__rates__project__commission_percentage')),
                                                         output_field=FloatField()))
    
    
    def _get_actuals_by_user(self, issues_qs, estimates_by_user):
        entries = Entry.objects.filter(issue__in=issues_qs)
        entries = entries.order_by("user_id")\
                       .filter(user__rates__project=F('issue__project'))\
                       .values("user_id")
        hours = self._get_actuals_enriched_with_costs(entries)
        actuals = {}

        for x in hours:
            raw_estimate = estimates_by_user.get(x['user_id'], {'raw_estimates':0})['raw_estimates']
            actuals[x['user_id']] = {'hours':x['sum_hours'],
                                     'calculated_velocity': (float(x['sum_hours'] or 1) / (raw_estimate or 1) )}
            if self.has_view_ctc_billable_rates:
                actuals[x['user_id']]['cost'] = x['cost']
                actuals[x['user_id']]['commission_cost'] = x['cost_with_commission']
            
        return actuals

    def _get_actuals_by_tag_category(self, issues_qs):
        entries = Entry.objects.filter(issue__in=issues_qs)
        entries = entries.order_by("user_id", "issue__tags__id")\
                       .filter(user__rates__project=F('issue__project'))\
                       .values("user_id", "issue__tags__id")\
                       .distinct()
        hours = self._get_actuals_enriched_with_costs(entries)
        hours = hours.annotate(category_id=F('issue__tags__category_id'))
        actuals_by_tag_category = {}

        for x in hours:
            values = actuals_by_tag_category.setdefault(x['category_id'], {})\
                                            .setdefault(x['user_id'], {})\
                                            .setdefault(x['issue__tags__id'], {})\

            values['hours'] = x['sum_hours']
            if self.has_view_ctc_billable_rates:
                values['cost'] = x['cost']
                values['cost_with_commission'] = x['cost_with_commission']
        
        return actuals_by_tag_category
        
    def _get_actuals_by_issue_and_user(self, issues_qs):
        entries = Entry.objects.filter(issue__in=issues_qs)
        entries = entries.order_by("issue_id", "user_id")\
                         .filter(user__rates__project=F('issue__project'))\
                         .values("issue_id", "user_id")\
                         .distinct()
        hours = self._get_actuals_enriched_with_costs(entries)
        actuals_by_issue_and_user = {}
        for x in hours:
            values = actuals_by_issue_and_user.setdefault(x['issue_id'], {})\
                                              .setdefault(x['user_id'], {})
            values['hours'] = x['sum_hours']
            if self.has_view_ctc_billable_rates:
                values['cost'] = x['cost']
                values['cost_with_commission'] = x['cost_with_commission']
                values['rate_with_commission'] = x['rate_with_commission']
        return actuals_by_issue_and_user

    def _get_actuals_by_issue(self, issues_qs):
        entries = Entry.objects.filter(issue__in=issues_qs)
        entries = entries.order_by("issue_id")\
                         .filter(user__rates__project=F('issue__project'))\
                         .values("issue_id")\
                         .distinct()
        hours = self._get_actuals_enriched_with_costs(entries)
        actuals_by_issue = {}
        for x in hours:
            values = actuals_by_issue.setdefault(x['issue_id'], {})
            values['hours'] = x['sum_hours']
            if self.has_view_ctc_billable_rates:
                values['cost'] = x['cost']
                values['cost_with_commission'] = x['cost_with_commission']
        return actuals_by_issue

    def _get_velocities_by_user(self, issues_qs, user_ids):
        velocities = {}
        cached_calcs_by_time_tracking_mode = {}
        
        for user_id in user_ids:

            time_tracking_mode = self._get_likely_time_tracking_mode(issues_qs, user_id)
            open_status_options = Issue.STATUSES_INDICATING_INCOMPLETE[time_tracking_mode]
            
            if time_tracking_mode not in cached_calcs_by_time_tracking_mode.keys():
                closed_issues_qs = issues_qs.exclude(status2__name__in=open_status_options)
                closed_estimates = self._get_estimates_by_user(closed_issues_qs) 
                closed_actuals = self._get_actuals_by_user(closed_issues_qs, closed_estimates)
                cached_calcs_by_time_tracking_mode['closed_estimates'] = closed_estimates
                cached_calcs_by_time_tracking_mode['closed_actuals'] = closed_actuals
            else:
                closed_estimates = cached_calcs_by_time_tracking_mode['closed_estimates']
                closed_actuals = cached_calcs_by_time_tracking_mode['closed_actuals']


            calculated_velocity = closed_actuals.setdefault(user_id, {}).setdefault('calculated_velocity', 0)
            velocities[user_id] = { 'closed_velocity': calculated_velocity,
                                    'ignoring_issues_in_status': open_status_options,
                                    'time_tracking_mode': time_tracking_mode }
        return velocities
            
    def _get_likely_time_tracking_mode(self, issues_qs, user_id):
        rate_guess = issues_qs.filter(project__rate__user_id=user_id)\
                              .values('project__rate__time_tracking_mode').first()
        if rate_guess is None:
            return 'developer'
        return rate_guess['project__rate__time_tracking_mode']
