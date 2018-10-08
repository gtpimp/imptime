import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from testable_serializer import TestableSerializer
from drf_compound_fields.fields import ListField
from imptime.models import VisualSpecDocument, VisualSpecFeatureAnnotation
logger = logging.getLogger(__name__)

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
    visual_spec_document_ids = ListField()
    visual_spec_annotation_ids_by_doc_id = serializers.DictField(child=ListField(child=serializers.IntegerField()))
    
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

        feature.visual_spec_document_ids = VisualSpecDocument.objects.filter(visual_spec_features__feature=feature)\
                                                                     .order_by("visual_spec_features__order")\
                                                                     .values_list('id', flat=True)
        feature.visual_spec_annotation_ids_by_doc_id = {}
        feature.visual_spec_annotation_ids = []
        for x in VisualSpecFeatureAnnotation.objects.filter(visual_spec_feature__feature=feature).values('visual_spec_feature__visual_spec_document_id', 'id'):
            feature.visual_spec_annotation_ids.append(x['id'])
            feature.visual_spec_annotation_ids_by_doc_id.setdefault(x['visual_spec_feature__visual_spec_document_id'], []).append(x['id'])

        testables = [x for x in feature.testables.all()]
        testables.sort(key=lambda x: x.order)
        feature.testables_in_order = testables
        
        return super(FeatureSerializer, self).to_representation(feature, *args, **kwargs)
    
