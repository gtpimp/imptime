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
from multiple_issue_summary_calculator import MultipleIssueSummaryCalculator
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
            issue_qs = self.allowed_issues()
            issue_qs = self.apply_filter(issue_qs, {}, issue_filter)
            calculator = MultipleIssueSummaryCalculator(user=self.request.user, issue_qs=issue_qs, summary_id=summary_id)
            res = calculator.get_data() 
            context['items'] = [ res ]
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['POST'])
    def download_summary(self, request, pk):
        filter = self._get_download_filter(request)
        issue_qs = self.allowed_issues()
        issue_qs = self.apply_filter(issue_qs, {}, filter)
        self.calculator = MultipleIssueSummaryCalculator(user=self.request.user, issue_qs=issue_qs)
        data = self.calculator.get_data()

        data['issues_by_id'] = dict( [(x['id'], x) for x in Issue.objects.filter(pk__in=data['all_issue_ids']).values('id', 'subject', 'number')] )
        data['users_by_id'] = dict( [(x['id'], x) for x in User.objects.filter(pk__in=data['all_user_ids']).values('id', "first_name", "last_name")] )
        data['sprints_by_id'] = dict( [(x['id'], x) for x in Sprint.objects.filter(pk__in=data['all_sprint_ids']).values('id', 'code', "name")] )
        data['tags_by_id'] = dict( [(x['id'], x) for x in Tag.objects.filter(pk__in=data['all_tag_ids']).values('id', "name", "category__name", "category_id")] )
        data['tag_categories_by_id'] = dict( [(x['category_id'], x) for x in Tag.objects.filter(pk__in=data['all_tag_ids']).values("category__name", "category_id").distinct()] )
        
        response, writer = file_helper.prepare_csv(request, "multiple_issue_summary")
        self._write_actuals_by_sprint(writer, data)
        self._write_user_actuals(writer, data)
        self._write_actuals_by_tag_category(writer, data)
        self._write_issue_actuals(writer, data)
        self._write_issue_list(writer, data)
        return response

    def _get_download_filter(self, request):
        raw_filter = json.loads(request.POST.get('post_params', '{}'))
        if len(raw_filter) == 0:
            raise Exception("Must filter this call")
        s = MultipleIssueFilterSerializer(data=raw_filter)
        s.is_valid(raise_exception=True)
        return s.validated_data
    
    def _write_actuals_by_sprint(self, writer, data):
        show_costs = self.calculator.has_view_ctc_billable_rates
        writer.writerow([""])
        writer.writerow(["Actuals by sprint"])

        header2 = ["Sprint", "Hours (time)", "Hours (decimal)"]
        if show_costs:
            header2.append("Cost")
        writer.writerow(header2)
        for sprint_id, sprint_data in data['actuals_by_sprint'].items():
            row = []
            row.append(data['sprints_by_id'][sprint_id]['name'])
            row.append(human_readable_hours(sprint_data['hours']))
            row.append(sprint_data['hours'])
            if show_costs:
                row.append(sprint_data['cost_with_commission'])
            writer.writerow(row)
        
    def _write_user_actuals(self, writer, data):
        show_costs = self.calculator.has_view_ctc_billable_rates
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

        show_costs = self.calculator.has_view_ctc_billable_rates
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
        show_costs = self.calculator.has_view_ctc_billable_rates
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
        header2 = ["Number", "Subject", "Status", "Description", "Comments"]
        
        for tag_category_id, tag_category in data['tag_categories_by_id'].items():
            header2.append(tag_category['category__name'])
        writer.writerow(header2)
            
        for issue in issues:
            comments = "\n".join([x.comment for x in issue.comments.all().order_by("created")])
            row = [issue.number, issue.subject, issue.status2.name, issue.description, comments]
            issue_tag_names_by_category_id = dict([(x.category_id, x.name) for x in issue.tags.all()])
            for tag_category_id, tag_category in data['tag_categories_by_id'].items():
                row.append(issue_tag_names_by_category_id.get(tag_category_id, ""))
            writer.writerow(row)

    def apply_filter(self, qs, raw_filter_args, issue_filter):
        issue_ids = issue_filter.pop('issue_ids', None)
        if issue_ids:
            qs = qs.filter(pk__in=[x for x in issue_ids if x])
        sprint_ids = issue_filter.pop('sprint_ids', None)
        if sprint_ids:
            qs = qs.filter(project_id__in=[x for x in sprint_ids if x])
        return super(MultipleIssueSummaryViewSet, self).apply_filter(qs, raw_filter_args)
