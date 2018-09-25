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
from imptime.models import FeatureHistory
from testable.models import Testable

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class TestableViewSet(BaseViewSet):

    def create(self, request):
        try:
            params = request.data
            issue_pk = params.get('issue_id')
            feature_pk = params.get('feature_id')
            testable_value = params['testable']
            issue = self.allowed_issue(issue_pk) if issue_pk else None
            feature = self.allowed_feature(feature_pk) if feature_pk else None
            testables = issue.testables.all().order_by('order').values_list('order', flat=True)
            max_order = 0
            if testables:
                max_order = max(testables)

            project = issue.project.business if issue else feature.project
                
            if issue and not self.logged_in_permissions(project).has_edit_description:
                raise Exception("Can't edit testables for issues")
            if feature and not self.logged_in_permissions(project).has_edit_feature:
                raise Exception("Can't edit testables for features")
                
            testable = Testable.objects.get_or_create(issue=issue,
                                                      feature=feature,
                                                      steps=testable_value,
                                                      project=project,
                                                      enriched_steps=MarkdownEnrichment(request.user)\
                                                                       .enrich(testable_value,
                                                                               project_id=project.id), #sic
                                                      order=max_order+1)[0]

            if issue:
                issue.save()
                IssueHistory.add_history(request.user, issue,
                                         "added testable", "", testable.steps)
            if feature:
                feature.save()
                FeatureHistory.add_history(request.user, feature,
                                           "added testable", "", testable.steps)
                
            data = {'status': 'success'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            issue_pk = params.get('issue_id')
            feature_pk = params.get('feature_id')
            testable_id = params['testable_id']
            testable_value = params['testable']

            issue = self.allowed_issue(issue_pk) if issue_pk else None
            feature = self.allowed_feature(feature_pk) if feature_pk else None
            project = issue.project.business if issue else feature.project

            if issue and not self.logged_in_permissions(project).has_edit_description:
                raise Exception("Can't edit testables for issues")
            if feature and not self.logged_in_permissions(project).has_edit_feature:
                raise Exception("Can't edit testables for features")

            if issue:
                testable = Testable.objects.filter(issue=issue).get(pk=testable_id)
                feature = testable.feature
            elif feature:
                testable = Testable.objects.filter(feature=feature).get(pk=testable_id)
                issue = testable.issue
                
            old_testable_value = testable.steps
            testable.steps = testable_value
            testable.enriched_steps = MarkdownEnrichment(request.user)\
                                                .enrich(testable.steps,
                                                        project_id=project.id) #sic

            if issue:
                IssueHistory.add_history(request.user, issue, "edited testable",
                                         old_testable_value, testable.steps)
                issue.save()
            if feature:
                FeatureHistory.add_history(request.user, issue, "edited testable",
                                         old_testable_value, testable.steps)
                feature.save()
            testable.save()
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
        

    
