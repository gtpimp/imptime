import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from testable_serializer import TestableSerializer
from drf_compound_fields.fields import ListField
from imptime.models import AnnotatedVisualSpecDocument
from collections import defaultdict
logger = logging.getLogger(__name__)

class FeatureStatsSerializer(BaseSerializer):
    num_testables = serializers.IntegerField()
    num_testables_without_issues = serializers.IntegerField()
    num_testables_with_issues = serializers.IntegerField()
    num_issues = serializers.IntegerField()
    num_issues_without_estimates = serializers.IntegerField()
    num_issues_with_estimates = serializers.IntegerField()
    estimated_hours = serializers.IntegerField()
    hours_clocked = serializers.IntegerField()
    num_fully_implemented_testables = serializers.IntegerField()
    num_not_fully_implemented_testables = serializers.IntegerField()

class FeatureSerializer(BaseSerializer):

    id = serializers.CharField()
    number = serializers.CharField()
    name = serializers.CharField()
    parent_id = serializers.CharField()
    order = serializers.FloatField()
    project_id = serializers.CharField()
    children_ids = serializers.ListField(serializers.CharField())
    issue_ids = serializers.ListField(serializers.CharField())
    project_id = serializers.CharField()
    description = serializers.CharField()
    created = serializers.DateTimeField()
    is_root_node = serializers.BooleanField()
    testables = TestableSerializer(many=True, source="testables_in_order")
    annotated_visual_spec_document_ids = ListField()
    stats = FeatureStatsSerializer()
    
    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        return super(FeatureSerializer, self).__init__(*args, **kwargs)

    def to_representation(self, feature, *args, **kwargs):
        feature.children_ids = [ x.id for x in feature.children.all() ]
        feature.issue_ids = [ x.id for x in feature.issues.all() ]
        project_feature_orders = feature.project_feature_orders.all()
        if len(project_feature_orders) == 0:
            feature.order = 0
        else:
            feature.order = project_feature_orders[0].order
        feature.is_root_node = feature.parent_id is None

        feature.annotated_visual_spec_document_ids = AnnotatedVisualSpecDocument.objects.filter(visual_spec_features__feature=feature)\
                                                                                        .order_by("visual_spec_features__order")\
                                                                                        .values_list('id', flat=True)
        testables = [x for x in feature.testables.all()]
        testables.sort(key=lambda x: x.order)
        feature.testables_in_order = testables

        feature.stats = self.set_calculate_issue_stats(feature)
        
        return super(FeatureSerializer, self).to_representation(feature, *args, **kwargs)
    
    def set_calculate_issue_stats(self, feature):

        stats = defaultdict(int)
        testables = feature.testables.all()
        stats['num_testables'] = len(testables)
        
        for feature_testable in testables:
            issues = feature_testable.implementing_issues.all()
            if len(issues) == 0:
                stats['num_testables_without_issues'] += 1
            else:
                stats['num_testables_with_issues'] += 1
            stats['num_issues'] += len(issues)

            fully_implemented_testable = False
            for issue in issues:

                points = [ x for x in issue.issue_points.all() if x.user_id == issue.assigned_to_id ]
                if len(points) == 0:
                    stats['num_issues_without_estimates'] += 1
                else:
                    estimate = points[0].points
                    stats['num_issues_with_estimates'] += 1
                    stats['estimated_hours'] += estimate or 0

                for entry in issue.entries.all():
                    stats['hours_clocked'] += float(entry.hours)

                issue_testables = issue.testables.all()
                for issue_testable in issue_testables:
                    if issue_testable.steps == feature_testable.steps:
                        fully_implemented_testable = True
                    
            if fully_implemented_testable:
                stats['num_fully_implemented_testables'] += 1
            else:
                stats['num_not_fully_implemented_testables'] += 1
                
        return stats
