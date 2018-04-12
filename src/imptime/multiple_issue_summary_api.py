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
from django.db.models import F, ExpressionWrapper
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory, Feature, Entry, ProjectRole, Tag, IssuePoints, BusinessPermissions
from timepiece.models import Business as Project
from imptime.multiple_issue_serializer import MultipleIssueFilterSerializer

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class MultipleIssueSummaryViewSet(BaseViewSet):

    def list(self, request):

        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            issue_filter = params['additional_params']['filter']
            summary_id = params.get('filter', {})['ids'][0]
            res = self._get_data(request, issue_filter, summary_id)
            context['items'] = [ res ]
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    def _get_data(self, request, filter, summary_id=None):
        qs = self.allowed_issues()
        qs = self.apply_filter(qs, {}, filter)

        self._set_permissions(request, qs)

        res = {}
        res['id'] = summary_id or 1
        res['all_user_ids'] = [x for x in Entry.objects.filter(issue__in=qs).values_list("user_id", flat=True).distinct() if x]
        res['all_tag_ids'] = [x for x in Tag.objects.filter(issues__in=qs).order_by("id").values_list("id", flat=True).distinct() if x]
        res['all_issue_ids'] = qs.values_list('id', flat=True)
        res['estimates_by_user'] = self._get_estimates_by_user(qs)
        res['estimates_by_tag_category'] = self._get_estimates_by_tag_category(qs)
        res['actuals_by_user'] = self._get_actuals_by_user(qs, res['estimates_by_user'])
        res['actuals_by_issue'] = self._get_actuals_by_issue(qs)
        res['actuals_by_issue_and_user'] = self._get_actuals_by_issue_and_user(qs)
        res['actuals_by_tag_category'] = self._get_actuals_by_tag_category(qs)
        res['velocities_by_user'] = self._get_velocities_by_user(qs, res['all_user_ids'])
        return res
    
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
            qs = qs.filter(pk__in=[x for x in issue_ids if x])
        sprint_ids = issue_filter.pop('sprint_ids', None)
        if sprint_ids:
            qs = qs.filter(project_id__in=[x for x in sprint_ids if x])
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

    def _get_actuals_enriched_with_costs(self, entries, include_rates=False):
        enriched = entries.annotate(sum_hours=Sum('hours'),
                                cost=Sum(F('hours')*F('user__rates__billable_amount')),
                                cost_with_commission=Sum(F('hours')*F('user__rates__billable_amount')*100/(100-F('user__rates__project__commission_percentage')),
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
        
    def _get_actuals_by_issue_and_user(self, issues_qs):
        entries = Entry.objects.filter(issue__in=issues_qs)
        entries = entries.order_by("issue_id", "user_id")\
                         .filter(user__rates__project=F('issue__project'))\
                         .values("issue_id", "user_id")\
                         .distinct()
        hours = self._get_actuals_enriched_with_costs(entries, include_rates=True)
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

    def _get_download_filter(self, request):
        raw_filter = json.loads(request.POST['post_params'])
        s = MultipleIssueFilterSerializer(data=raw_filter)
        s.is_valid(raise_exception=True)
        return s.validated_data
    
    @detail_route(methods=['POST'])
    def download_summary(self, request, pk):
        filter = self._get_download_filter(request)
        data = self._get_data(request, filter)

        data['issues_by_id'] = dict( [(x['id'], x) for x in Issue.objects.filter(pk__in=data['all_issue_ids']).values('id', 'subject', 'number')] )
        data['users_by_id'] = dict( [(x['id'], x) for x in User.objects.filter(pk__in=data['all_user_ids']).values('id', "first_name", "last_name")] )
        data['tags_by_id'] = dict( [(x['id'], x) for x in Tag.objects.filter(pk__in=data['all_tag_ids']).values('id', "name", "category__name", "category_id")] )
        data['tag_categories_by_id'] = dict( [(x['category_id'], x) for x in Tag.objects.filter(pk__in=data['all_tag_ids']).values("category__name", "category_id").distinct()] )
        
        response, writer = file_helper.prepare_csv(request, "multiple_issue_summary")
        self._write_user_actuals(writer, data)
        self._write_actuals_by_tag_category(writer, data)
        self._write_issue_actuals(writer, data)
        self._write_issue_list(writer, data)
        return response

    def _write_user_actuals(self, writer, data):
        show_costs = self.has_view_ctc_billable_rates
        writer.writerow([""])
        writer.writerow(["Actuals by user"])

        header2 = ["User", "Hours (time)", "Hours (decimal)", "Calculated velocity"]
        if show_costs:
            header2.append("Cost")
        writer.writerow(header2)
        for user_id, user in data['users_by_id'].items():
            user_data = data['actuals_by_user'][user_id]
            row = ["%s %s" % (user['first_name'], user['last_name'])]
            row.append(human_readable_hours(user_data['hours']))
            row.append(user_data['hours'])
            row.append("{0:.1f}".format(user_data['calculated_velocity']))
            if show_costs:
                row.append(user_data['commission_cost'])
            writer.writerow(row)
    
    def _write_issue_actuals(self, writer, data):

        show_costs = self.has_view_ctc_billable_rates
        writer.writerow([""])
        writer.writerow(["Actuals by issue"])

        header2 = ["Issue id", "Issue Subject"]
        for user_id, user in data['users_by_id'].items():
            header2.append("%s %s" % (user['first_name'], user['last_name']))
            header2.append("")
            if show_costs:
                header2.append("")
                header2.append("")
        if show_costs:
            header2.append("Issue total")
        writer.writerow(header2)

        header3 = ["", ""]
        for user_id, user in data['users_by_id'].items():
            header3.append("Hours (time)")
            header3.append("Hours (decimal)")
            if show_costs:
                header3.append("Rate")
                header3.append("Cost")
        if show_costs:
            header3.append("")
        writer.writerow(header3)
        
        for issue_id, actuals_for_issue_by_user in data['actuals_by_issue_and_user'].items():
            issue = data['issues_by_id'][issue_id]
            row = [issue['number'], issue['subject']]
            for user_id in data['users_by_id'].keys():
                if user_id in actuals_for_issue_by_user:
                    actuals_for_user = actuals_for_issue_by_user[user_id]
                    row.append(human_readable_hours(actuals_for_user['hours']))
                    row.append(actuals_for_user['hours'])
                    if show_costs:
                        row.append(actuals_for_user['rate_with_commission'])
                        row.append(actuals_for_user['cost_with_commission'])
                else:
                    row.extend(["",""])
                    if show_costs:
                        row.extend(["",""])
            if show_costs:
                row.append(data['actuals_by_issue'][issue_id]['cost_with_commission'])
            writer.writerow(row)

    def _write_actuals_by_tag_category(self, writer, data):
        show_costs = self.has_view_ctc_billable_rates
        writer.writerow([""])
        writer.writerow(["Actuals by category"])
        header2 = ["User", "Tag category", "Tag", "Hours (time)", "Hours (decimal)"]
        if show_costs:
            header2.append("Cost")
        writer.writerow(header2)

        for category_id, cat_data in data['actuals_by_tag_category'].items():
            for user_id, user in cat_data.items():
                user_data = data['users_by_id'][user_id]
                user_name = "%s %s" % (user_data['first_name'], user_data['last_name']) 
                for tag_id, tag in data['tags_by_id'].items():
                    if tag_id in user:
                        tag_data = user[tag_id]
                        row = [user_name,
                               tag['category__name'],
                               tag['name'],
                               human_readable_hours(tag_data['hours']),
                               tag_data['hours']]
                        if show_costs:
                            row.append(tag_data['cost_with_commission'])
                        writer.writerow(row)
            

    def _write_issue_list(self, writer, data):
        issues = Issue.objects.filter(pk__in=data['issues_by_id'].keys()).prefetch_related('tags').select_related('status2')
        sample_issue = issues.first()
        if sample_issue:
            sprint_id = sample_issue.project_id #sic
            issues = issues.order_by_project_id(sprint_id) #sic
            
        writer.writerow([""])
        writer.writerow(["Issues"])
        header2 = ["Number", "Subject", "Status"]
        
        for tag_category_id, tag_category in data['tag_categories_by_id'].items():
            header2.append(tag_category['category__name'])
        writer.writerow(header2)
            
        for issue in issues:
            row = [issue.number, issue.subject, issue.status2.name]
            issue_tag_names_by_category_id = dict([(x.category_id, x.name) for x in issue.tags.all()])
            for tag_category_id, tag_category in data['tag_categories_by_id'].items():
                row.append(issue_tag_names_by_category_id.get(tag_category_id, ""))
            writer.writerow(row)
