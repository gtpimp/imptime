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
            issue_pk = params.get('issue_id')
            feature_pk = params.get('feature_id')
            testable_value = params['testable']
            name = params.get('name', None)
            issue = self.allowed_issue(issue_pk) if issue_pk else None
            feature = self.allowed_feature(feature_pk) if feature_pk else None
            if issue:
                testables = issue.testables.all().order_by('order').values_list('order', flat=True)
            elif feature:
                testables = feature.testables.all().order_by('order').values_list('order', flat=True)
            max_order = 0
            if testables:
                max_order = max(testables)

            project = issue.project.business if issue else feature.project
                
            if issue and not self.logged_in_permissions(project).has_edit_description:
                raise Exception("Can't edit testables for issues")
            if feature and not self.logged_in_permissions(project).has_edit_feature:
                raise Exception("Can't edit testables for features")
                
            testable = Testable.objects.get_or_create(issue=issue,
                                                      name=name,
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
                testable.features.add(feature)
                testable.save()
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
            testable_ids = params.get('item_ids', [pk])
            name = params.get('value', None)

            for testable_id in testable_ids:
                testable = self.allowed_testables().get(pk=testable_id)
                issue = None
                features = None
                project = None
                
                if testable.issue is not None:
                    issue = testable.issue
                    project = issue.project.business
                    if not self.logged_in_permissions(project).has_edit_description:
                        raise Exception("Can't edit testable for issues")

                if testable.features.count() > 0:
                    features = testable.features.all()
                    project = features[0].project
                    if not self.logged_in_permissions(project).has_edit_feature:
                        raise Exception("Can't edit testable for features")

            if issue:
                testable = Testable.objects.filter(issue=issue).get(pk=testable_id)
                feature = testable.features.all().first()
            elif feature:
                testable = Testable.objects.filter(features=feature).get(pk=testable_id)
                issue = testable.issue
                
            old_name = testable.name
            testable.name = name
            
            if issue:
                IssueHistory.add_history(request.user, issue, "edited testable name",
                                         old_name, testable.name)
                issue.save()
            if feature:
                FeatureHistory.add_history(request.user, feature, "edited testable name",
                                           old_name, testable.name)
                feature.save()
            testable.save()
            data = {'status': 'success', 'payload': testable_ids}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def delete(self, request, pk):
        try:
            params = request.data
            issue_pk = params.get('issue_id')
            feature_pk = params.get('feature_id')
            testable_id = params['testable_id']
            if issue_pk:
                issue = self.allowed_issue(issue_pk)
                testable = Testable.objects.filter(issue=issue).get(pk=testable_id)
                IssueHistory.add_history(request.user, issue, "deleted testable", testable.steps, "")
            if feature_pk:
                feature = self.allowed_feature(feature_pk)
                testable = Testable.objects.filter(features=feature).get(pk=testable_id)
            testable.delete()

            if issue_pk:
                Testable.renumber_for_issue(issue.id)
                issue.save()
            if feature_pk:
                Testable.renumber_for_feature(feature.id)
                feature.save()

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
        

    
