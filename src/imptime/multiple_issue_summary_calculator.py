from timepiece.models import Issue, IssueHistory, Entry, ProjectRole, Tag, IssuePoints, BusinessPermissions
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from django.db.models import Count, Sum, FloatField
from django.db.models import F, ExpressionWrapper
from collections import OrderedDict, defaultdict

class MultipleIssueSummaryCalculator(object):

    def __init__(self, user, issue_qs, summary_id=None):
        super(MultipleIssueSummaryCalculator, self).__init__()
        self.user = user
        self.issue_qs = issue_qs
        self.summary_id = summary_id
        
    def get_data(self):
        qs = self.issue_qs
        self._set_permissions(qs)

        res = {}
        res['id'] = self.summary_id or 1
        res['all_user_ids'] = [x for x in Entry.objects.filter(issue__in=qs).values_list("user_id", flat=True).distinct() if x]
        res['all_tag_ids'] = [x for x in Tag.objects.filter(issues__in=qs).order_by("id").values_list("id", flat=True).distinct() if x]
        res['all_issue_ids'] = qs.values_list('id', flat=True)
        res['all_sprint_ids'] = [x for x in Sprint.objects.filter(issues__in=qs).order_by("id").values_list("id", flat=True).distinct() if x]
        res['estimates_by_user'] = self._get_estimates_by_user(qs)
        res['estimates_by_issue'] = self._get_estimates_by_issue(qs)
        res['estimates_by_tag_category'] = self._get_estimates_by_tag_category(qs)
        res['actuals_by_user'] = self._get_actuals_by_user(qs, res['estimates_by_user'])
        res['actuals_by_issue'] = self._get_actuals_by_issue(qs)
        res['actuals_by_issue_and_user'] = self._get_actuals_by_issue_and_user(qs)
        res['actuals_by_tag_category'] = self._get_actuals_by_tag_category(qs)
        res['actuals_by_sprint'] = self._get_actuals_by_sprint(qs)
        res['velocities_by_user'] = self._get_velocities_by_user(qs, res['all_user_ids'])
        res['revised_estimates_by_user'] = self._get_revised_estimates_by_user(qs, estimates_by_user=res['estimates_by_user'],
                                                                               velocities_by_user=res['velocities_by_user'])
        return res
    
    def _set_permissions(self, issues_qs):
        self.has_view_ctc_billable_rates = True
        self.has_see_other_user_points = True
        for project_id in issues_qs.values('project__business__id')\
                                   .order_by('project__business__id')\
                                   .distinct()\
                                   .values_list('project__business_id', flat=True):

            project = Project.objects.get(pk=project_id)
            bp = BusinessPermissions.for_user(self.user, project, auto_create=False)  # sic

            if not bp.has_view_ctc_billable_rates:
                self.has_view_ctc_billable_rates = False
            if not bp.has_see_other_user_points:
                self.has_see_other_user_points = False
    
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
            if self.has_see_other_user_points or x['user_id'] == self.user.id:
                estimates.setdefault(x['user_id'], {})['velocity_estimates'] = x['velocity_adjusted_points']
                estimates[x['user_id']]['given_velocity'] = \
                              estimates[x['user_id']]['velocity_estimates']/estimates[x['user_id']]['raw_estimates']

        if self.has_view_ctc_billable_rates:

            velocity_adjusted_costs = estimates_with_rates\
                                      .annotate(velocity_adjusted_cost=Sum(F('user__rates__velocity')*F('points')*F('user__rates__billable_amount'),
                                                                           output_field=FloatField()))

            for x in velocity_adjusted_costs:
                if self.has_see_other_user_points or x['user_id'] == self.user.id:
                    estimates.setdefault(x['user_id'], {})['velocity_cost'] = x['velocity_adjusted_cost']

            scope_creep_adjusted_costs = estimates_with_rates\
                                         .annotate(scope_creep_adjusted_cost=Sum(F('user__rates__velocity')*F('points')*F('user__rates__billable_amount')*F('issue__project__ratio_scope_creep'),
                                                                                 output_field=FloatField()))

            for x in scope_creep_adjusted_costs:
                if self.has_see_other_user_points or x['user_id'] == self.user.id:
                    estimates.setdefault(x['user_id'], {})['scope_creep_cost'] = x['scope_creep_adjusted_cost']                    

            cost_with_commission = estimates_with_rates\
                                   .annotate(scope_creep_adjusted_cost=Sum(F('user__rates__velocity')*F('points')*F('user__rates__billable_amount')*F('issue__project__ratio_scope_creep')*100/
                                                                        (100-F('user__rates__project__commission_percentage')),
                                                                         output_field=FloatField()))

            for x in cost_with_commission:
                if self.has_see_other_user_points or x['user_id'] == self.user.id:
                    estimates.setdefault(x['user_id'], {})['scope_creep_commission_cost'] = x['scope_creep_adjusted_cost']

        return estimates

    def _get_estimates_by_issue(self, issues_qs):
        estimates = defaultdict(float)

        values = ['id',
                  'assigned_to_id',
                  'assigned_to__user_points__points',
                  'assigned_to__rates__velocity',
                  'velocity_adjusted_estimate',
                  'scope_creep_adjusted_estimate'
        ]
        issues_qs = issues_qs.filter(assigned_to__rates__project=F('project'),
                                     assigned_to__user_points__issue_id=F('id'))\
                             .order_by("id")
        issues_qs = issues_qs.annotate(velocity_adjusted_estimate=Sum(F('assigned_to__rates__velocity')*F('assigned_to__user_points__points'),
                                                                      output_field=FloatField()))
        issues_qs = issues_qs.annotate(scope_creep_adjusted_estimate=Sum(F('assigned_to__rates__velocity')*F('assigned_to__user_points__points')*F('project__ratio_scope_creep'),
                                                                         output_field=FloatField()))
        if self.has_view_ctc_billable_rates:
            issues_qs = issues_qs.annotate(velocity_adjusted_cost=Sum(F('assigned_to__rates__velocity')*F('assigned_to__user_points__points')*F('assigned_to__rates__billable_amount')*100/
                                                                      (100-F('assigned_to__rates__project__commission_percentage')),
                                                                      output_field=FloatField()))

            issues_qs = issues_qs.annotate(scope_creep_adjusted_cost=Sum(F('assigned_to__rates__velocity')*F('assigned_to__user_points__points')*F('assigned_to__rates__billable_amount')*F('project__ratio_scope_creep')*100/
                                                                         (100-F('assigned_to__rates__project__commission_percentage')),
                                                                         output_field=FloatField()))
            
            values.append('assigned_to__rates__billable_amount')
            values.append('assigned_to__rates__project__commission_percentage')
            values.append('velocity_adjusted_cost')
            values.append('scope_creep_adjusted_cost')
            
        issues_qs = issues_qs.values(*values)

        for issue_estimate in issues_qs:
            estimates[str(issue_estimate['id'])] = issue_estimate

        return estimates
        
    
    def _get_estimates_by_tag_category(self, issues_qs):
        estimates_by_tag_category = {}

        points = IssuePoints.objects.filter(points__gt=0, issue__in=issues_qs)
        raw_estimated_hours_by_tag = points.order_by("user_id", "issue__tags__id")\
                                           .values("user_id", "issue__tags__id")\
                                           .distinct()\
                                           .annotate(sum_points=Sum("points"), category_id=F('issue__tags__category_id'))
        for x in raw_estimated_hours_by_tag:
            if self.has_see_other_user_points or x['user_id'] == self.user.id:
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
            if self.has_see_other_user_points or x['user_id'] == self.user.id:
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
                if self.has_see_other_user_points or x['user_id'] == self.user.id:
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
                if self.has_see_other_user_points or x['user_id'] == self.user.id:
                    estimates_by_tag_category.setdefault(x['category_id'], {})\
                                             .setdefault(x['user_id'], {})\
                                             .setdefault(x['issue__tags__id'], {})\
                                             ['velocity_commission_cost'] = x['velocity_adjusted_cost']
                
            
        return estimates_by_tag_category

    def _get_actuals_enriched_with_costs(self, entries, include_rates=False):
        enriched = entries.annotate(sum_hours=Sum('hours'),
                                    cost=Sum(F('hours')*F('user__rates__billable_amount')),
                                    cost_with_commission=Sum(F('hours')*F('user__rates__billable_amount')*F('user__rates__project__ratio_scope_creep')*100/(100-F('user__rates__project__commission_percentage')),
                                                             output_field=FloatField()))
        if include_rates:
            # Note that this will separate entries by user, so you should only do this for '_by_user' type summaries
            enriched = enriched.annotate(rate_with_commission=ExpressionWrapper(F('user__rates__billable_amount')*100/(100-F('user__rates__project__commission_percentage')), output_field=FloatField()))
                                
        return enriched
    
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

    def _get_actuals_by_sprint(self, issues_qs):
        entries = Entry.objects.filter(issue__in=issues_qs)
        entries = entries.filter(user__rates__project=F('issue__project'))\
                  .order_by("issue__project_id")\
                  .values("issue__project_id")\
                  .distinct()

        hours = self._get_actuals_enriched_with_costs(entries, include_rates=True)
        actuals_by_sprint = OrderedDict()
        for x in hours:
            values = actuals_by_sprint.setdefault(x['issue__project_id'], {})
            values['hours'] = x['sum_hours']
            if self.has_view_ctc_billable_rates:
                values['cost'] = x['cost']
                values['cost_with_commission'] = x['cost_with_commission']
        return actuals_by_sprint
    
    def _get_actuals_by_issue_and_user(self, issues_qs):
        entries = Entry.objects.filter(issue__in=issues_qs)
        entries = entries.filter(user__rates__project=F('issue__project'))\
                         .values("issue_id", "user_id")\
                         .distinct()

        sample_issue = issues_qs.first()
        if sample_issue:
            sprint_id = sample_issue.project_id #sick
            entries = entries.order_by_project_id(sprint_id, supplementary_orders=["user_id"])
        else:
            entries = entries.order_by("issue_id", "user_id")
        

        hours = self._get_actuals_enriched_with_costs(entries, include_rates=True)
        actuals_by_issue_and_user = OrderedDict()
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

    def _get_revised_estimates_by_user(self, qs, estimates_by_user, velocities_by_user):
        revised_estimates_by_user = {}
        for user_id, user_data in estimates_by_user.items():
            velocity_data = velocities_by_user.get(user_id)
            if velocity_data is None:
                continue
            actual_velocity = velocity_data['closed_velocity']
            revised_estimates_by_user[user_id] = { 'velocity_estimates': user_data.get('raw_estimates', 0) * actual_velocity,
                                                   'velocity_cost': (user_data.get('velocity_cost', 0) * actual_velocity) / (user_data.get('given_velocity', 1) or 1),
                                                   'velocity_commission_cost': (user_data.get('velocity_commission_cost', 0) * actual_velocity) / (user_data.get('given_velocity', 1) or 1) }
        return revised_estimates_by_user
    
    def _get_likely_time_tracking_mode(self, issues_qs, user_id):
        rate_guess = issues_qs.filter(project__rate__user_id=user_id)\
                              .values('project__rate__time_tracking_mode').first()
        if rate_guess is None:
            return 'developer'
        return rate_guess['project__rate__time_tracking_mode']

