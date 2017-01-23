import logging
from issue_serializer import IssueSerializer
from issue_serializer import IssueGeneralDetailsSerializer
from issue_serializer import IssueWithEstimatesSerializer
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory, Feature

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class IssueViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            issues = self.allowed_issues().order_by("order")

            issues = self.apply_filter(qs=issues,
                                       raw_filter_args=filter_args)
            issues = self.apply_pagination(qs=issues,
                                           pagination=pagination)

            if format_args.get('ids_only', None):
                context['ids'] = [str(x) for x in issues.values_list(
                    'id', flat=True)]
            else:

                detail_levels = format_args.get('detail_level', '').split(",")
                if len(detail_levels) == 0:
                    s = IssueSerializer(issues, many=True)
                elif 'estimates' in detail_levels:
                    s = IssueWithEstimatesSerializer(issues, many=True)
                elif 'general' in detail_levels:
                    s = IssueGeneralDetailsSerializer(issues, many=True)

                issues_data = s.data
                context['issues'] = issues_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            issue = self.allowed_issue(pk)
            field_name = params['field_name']
            new_value = params['value']

            if field_name == "subject":
                old_subject = issue.subject
                issue.subject = new_value
                IssueHistory.add_history(
                    self.request.user, issue, "changed subject",
                    old_subject, issue.subject)
            elif field_name == "description":
                old_description = issue.description
                issue.description = new_value
                IssueHistory.add_history(
                    self.request.user, issue, "changed description",
                    old_description, issue.description)
            elif field_name == "status":
                old_status = issue.status
                issue.status = new_value
                IssueHistory.add_history(
                    self.request.user, issue, "changed status",
                    old_status, issue.status)
            elif field_name == "feature_name":
                old_feature_name = issue.feature.name \
                  if issue.feature else "none"
                issue.feature = Feature.objects.get_or_create(
                    business=issue.project.business, name=new_value)[0]
                IssueHistory.add_history(
                    self.request.user, issue, "changed feature",
                    old_feature_name, issue.feature.name)
            elif field_name == 'issue_id_after':
                old_order = issue.order
                after_issue = self.allowed_issue(new_value)
                issue.move_after(after_issue)
                IssueHistory.add_history(
                    self.request.user, issue, "changed order",
                    old_order, issue.order)
            elif field_name == 'assigned_to_id':
                old_assigned_to = \
                    issue.assigned_to.username \
                    if issue.assigned_to else "no-one"
                issue.assigned_to_id = new_value
                new_assigned_to = \
                    User.objects.get(pk=new_value).username \
                    if new_value else "no-one"
                IssueHistory.add_history(
                    self.request.user, issue, "changed assigned to",
                    old_assigned_to, new_assigned_to)
            else:
                raise Exception("Unsupported field name: %s" % field_name)
            issue.save()

            data = {'status': 'success', 'payload': pk}

        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['issue']
            sprint_id = params['sprint_id']
            issue_id_before = params['issue_id_before']
            if issue_id_before:
                issue_before = self.allowed_issue(issue_id_before)
                order = issue_before.order + 0.5
            else:
                order = 0
            sprint = self.allowed_sprint(sprint_id)
            issue = Issue.objects.create(
                project=sprint,   # sic
                order=order,
                number=Issue.get_next_issue_number(sprint.business),
                subject=params['subject'])
            issue.renumber_issue_order()
            s = IssueSerializer(issue)
            issue_data = s.data
            IssueHistory.add_history(self.request.user, issue,
                                     "created", "", issue.number)
            context['issue'] = issue_data
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))

    def delete(self, request):
        try:
            context = {}
            params = request.data
            issue_id = params['issue_id']
            issue = self.allowed_issue(issue_id)
            IssueHistory.add_history(self.request.user, issue,
                                     "deleted", issue.id, "")
            issue.delete()
            context['issue_id'] = issue_id
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))
