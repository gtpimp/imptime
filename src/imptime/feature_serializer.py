import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from testable_serializer import TestableSerializer
from drf_compound_fields.fields import ListField
from imptime.models import AnnotatedVisualSpecDocument
logger = logging.getLogger(__name__)

class FeatureStatsSerializer(BaseSerializer):
    num_features_missing_testables = serializers.FloatField()
    num_testables = serializers.FloatField()
    num_testables_without_issues = serializers.FloatField()
    num_testables_with_issues = serializers.FloatField()
    num_issues = serializers.FloatField()
    num_issues_without_estimates = serializers.FloatField()
    num_issues_with_estimates = serializers.FloatField()
    estimated_hours = serializers.FloatField()
    hours_clocked = serializers.FloatField()
    num_fully_implemented_testables = serializers.FloatField()
    num_not_fully_implemented_testables = serializers.FloatField()

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
    nested_stats = FeatureStatsSerializer()
    
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

        return super(FeatureSerializer, self).to_representation(feature, *args, **kwargs)
    
