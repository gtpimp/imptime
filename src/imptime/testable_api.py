import logging
from issue_serializer import IssueSerializer
from issue_serializer import IssueGeneralDetailsSerializer
from issue_serializer import IssueWithEstimatesSerializer
from django.utils import timezone
from rest_framework.decorators import detail_route
from markdown_enrichment import MarkdownEnrichment
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory
from timepiece.models import ProjectIssueOrder as SprintIssueOrder
from timepiece.models import IssueStatus
from testable.models import Testable

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class TestableViewSet(BaseViewSet):

    def list(self, request):

        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            testables = self.allowed_testables()
            testables = self.apply_filter(qs=testables, raw_filter_args=filter_args)

            if 'sprint_id' in filter_args:
                testables = testables.order_by_project_id(project_id=filter_args['sprint_id']) #sic
            if 'copy_sprint_id' in filter_args:
                testables = testables.order_by_project_id(project_id=filter_args['copy_sprint_id']) #sic

            testables = self.apply_pagination(qs=testables, pagination=pagination)

            if format_args.get('ids_only', None):
                context['ids'] = [str(x) for x in testables.values_list(
                    'id', flat=True)]
            else:

                detail_levels = format_args.get('detail_level', '').split(",")
                if len(detail_levels) == 0:
                    s = TestableSerializer(testables, logged_in_user=request.user, many=True)
                elif 'estimates' in detail_levels:
                    s = TestableWithEstimatesSerializer(testables, many=True)
                elif 'general' in detail_levels:
                    s = TestableGeneralDetailsSerializer(testables, many=True)
                else:
                    testables = self._enrich_testables_qs(testables)
                    s = TestableSerializer(testables, logged_in_user=request.user, many=True)

                testables_data = s.data
                context['testables'] = testables_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))
    
    def create(self, request):
        try:
            params = request.data
            issue_pk = params['issue_id']
            testable_value = params['testable']
            issue = self.allowed_issue(issue_pk)
            testables = issue.testables.all().order_by('order').values_list('order', flat=True)
            max_order = 0
            if testables:
                max_order = max(testables)

            if not self.logged_in_permissions(issue.project.business).has_edit_description:
                raise Exception("Can't edit testables")
                
            testable = Testable.objects.get_or_create(issue=issue,
                                                      steps=testable_value,
                                                      project=issue.project_id,
                                                      enriched_steps=MarkdownEnrichment(request.user)\
                                                                       .enrich(testable_value,
                                                                               project_id=issue.project.business_id), #sic
                                                      order=max_order+1)[0]
            issue.save()
            IssueHistory.add_history(request.user, issue,
                                     "added testable", "", testable.steps)
            data = {'status': 'success'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            issue_pk = params['issue_id']
            testable_id = params['testable_id']
            testable_value = params['testable']

            issue = self.allowed_issue(issue_pk)

            if not self.logged_in_permissions(issue.project.business).has_edit_description:
                raise Exception("Can't edit testables")
            
            testable = Testable.objects.filter(issue=issue).get(pk=testable_id)
            old_testable_value = testable.steps
            testable.steps = testable_value
            testable.enriched_steps = MarkdownEnrichment(request.user)\
                                                .enrich(testable.steps,
                                                        project_id=issue.project.business_id) #sic

            IssueHistory.add_history(request.user, issue, "edited testable",
                                     old_testable_value, testable.steps)
            testable.save()
            issue.save()
            data = {'status': 'success'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def delete(self, request, pk):
        try:
            params = request.data
            issue_pk = params['issue_id']
            testable_id = params['testable_id']
            issue = self.allowed_issue(issue_pk)
            testable = Testable.objects.filter(issue=issue).get(pk=testable_id)
            IssueHistory.add_history(request.user, issue, "deleted testable", testable.steps, "")
            testable.delete()
            Testable.renumber(issue.id)
            issue.save()

            data = {'status': 'success'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['POST'])
    def promoteToIssue(self, request, pk):
        try:
            testable_id = pk
            testable = Testable.objects.get(pk=testable_id)
            issue = self.allowed_issue(testable.issue_id)
            if not self.logged_in_permissions(issue.project.business).has_add_issue:
                raise Exception("Can't add issues")
            new_issue = Issue.objects.create(project=issue.project,
                                             subject="%s (Testable %s)" % (issue.subject, testable.order),
                                             issue_type='issue',
                                             status2=IssueStatus.objects.get_or_create(name='new', business=issue.project.business)[0],
                                             assigned_to=issue.assigned_to,
                                             parent_group_id=issue.parent_group_id,
                                             number=Issue.get_next_issue_number(issue.project.business), #sic
                                             description=issue.description,
                                             story_points=issue.story_points,
                                             created=timezone.now(),
                                             modified=timezone.now())
            testable.issue = new_issue
            testable.order = 1
            testable.save()
            new_issue.save()
            SprintIssueOrder.insert_after(new_issue, issue)
            Testable.renumber(issue.id)
            issue.save()
            
            new_issue_id = new_issue.id
            data = {'status': 'success', 'payload': {'new_issue_id': new_issue_id}}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
        

    
