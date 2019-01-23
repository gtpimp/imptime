import logging
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import IssueHistory
from imptime.models import FeatureHistory
from testable.models import TestableLine
from testable_line_serializer import TestableLineSerializer

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class TestableLineViewSet(BaseViewSet):

    def list(self, request):

        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            testable_lines = self.allowed_testable_lines()
            testable_lines = self.apply_filter(qs=testable_lines, raw_filter_args=filter_args)

            if 'sprint_id' in filter_args:
                testable_lines = testable_lines.order_by_project_id(project_id=filter_args['sprint_id']) #sic
            if 'copy_sprint_id' in filter_args:
                testable_lines = testable_lines.order_by_project_id(project_id=filter_args['copy_sprint_id']) #sic

            testable_lines = self.apply_pagination(qs=testable_lines, pagination=pagination)

            if format_args.get('ids_only', None):
                context['ids'] = [str(x) for x in testable_lines.values_list(
                    'id', flat=True)]
            else:
                s = TestableLineSerializer(testable_lines, many=True)
                testable_lines_data = s.data
                context['testable_lines'] = testable_lines_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))
    
    def create(self, request):
        try:
            context = {}
            params = request.data['item']
            testable_pk = params['testable_id']
            instruction = params['instruction']
            testable = self.allowed_testables().get(pk=testable_pk)
            new_order = (max(testable.testable_lines.all().values_list("order", flat=True) or [0]) or 0)+1

            issue = None
            features = None
            project = None

            if testable.issue is not None:
                issue = testable.issue
                project = issue.project.business
                if not self.logged_in_permissions(project).has_edit_description:
                    raise Exception("Can't edit testable_lines for issues")

            if testable.features.count() > 0:
                features = testable.features.all()
                project = features[0].project
                if not self.logged_in_permissions(project).has_edit_feature:
                    raise Exception("Can't edit testable_lines for features")

            testable_line = TestableLine.objects.create(testable=testable,
                                                        instruction=instruction,
                                                        order=new_order)
            TestableLine.renumber_for_testable(testable_pk)
                
            if issue:
                IssueHistory.add_history(request.user, issue, "created testable step",
                                         "", instruction)
                issue.save()
            if features:
                for feature in features:
                    FeatureHistory.add_history(request.user, feature, "created testable step",
                                               "", instruction)
                    feature.save()
                

            context['item'] = TestableLineSerializer(testable_line).data
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
 
    def update(self, request, pk):
        try:
            params = request.data
            testable_line_ids = params.get('item_ids', [pk])
            field_name = params['field_name']
            value = params['value']

            for testable_line_id in testable_line_ids:
            
                testable_line = self.allowed_testable_lines().get(pk=testable_line_id)
                testable = testable_line.testable

                issue = None
                features = None
                project = None

                if testable.issue is not None:
                    issue = testable.issue
                    project = issue.project.business
                    if not self.logged_in_permissions(project).has_edit_description:
                        raise Exception("Can't edit testable_lines for issues")

                if testable.features.count() > 0:
                    features = testable.features.all()
                    project = features[0].project
                    if not self.logged_in_permissions(project).has_edit_feature:
                        raise Exception("Can't edit testable_lines for features")

                if field_name == 'instruction':
                    old_value = testable_line.instruction
                    testable_line.instruction = value
                    testable_line.save()
                    testable.save()
                    TestableLine.renumber_for_testable(testable.id)

                    if issue:
                        if old_value != testable_line.instruction:
                            IssueHistory.add_history(request.user, issue, "edited testable step",
                                                     old_value, testable_line.instruction)
                        issue.save()
                    if features:
                        for feature in features:
                            if old_value != testable_line.instruction:
                                FeatureHistory.add_history(request.user, feature, "edited testable steps",
                                                           old_value, testable_line.instruction)
                            feature.save()
                    
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                    

                
            data = {'status': 'success', 'payload': testable_line_ids}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def delete(self, request, pk):
        try:
            params = request.data

            if 'testable_line_ids' in params:
                testable_line_ids = params['testable_line_ids']
            else:
                testable_line_ids = [pk]
                
            for testable_line_id in testable_line_ids:

                testable_line = self.allowed_testable_lines().get(pk=testable_line_id)
                testable = testable_line.testable

                issue = None
                features = None
                project = None

                if testable.issue is not None:
                    issue = testable.issue
                    project = issue.project.business
                    if not self.logged_in_permissions(project).has_edit_description:
                        raise Exception("Can't edit testable lines for issues")

                if testable.features.count() > 0:
                    features = testable.features.all()
                    project = features[0].project
                    if not self.logged_in_permissions(project).has_edit_feature:
                        raise Exception("Can't edit testable lines for features")

                testable_line.delete()
                TestableLine.renumber_for_testable(testable_line.testable_id)

                if issue:
                    IssueHistory.add_history(request.user, issue, "deleted testable line", testable_line.instruction, "")
                if features:
                    for feature in features:
                        FeatureHistory.add_history(request.user, feature, "deleted testable line", testable_line.instruction, "")

                if issue:
                    issue.save()
                if features:
                    for feature in features:
                        feature.save()

            data = {'status': 'success'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
