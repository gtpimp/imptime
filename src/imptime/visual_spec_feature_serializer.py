import logging
from base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import VisualSpecFeature
from visual_spec_feature_annotation_serializer import VisualSpecFeatureAnnotationSerializer
logger = logging.getLogger(__name__)

class VisualSpecFeatureSerializer(BaseModelSerializer):
    id = serializers.CharField(required=False)
    visual_spec_document_id = serializers.CharField()
    feature_id = serializers.CharField(required=False)
    annotation_ids = serializers.ListField(child=VisualSpecFeatureAnnotationSerializer())

    class Meta:
        model = VisualSpecFeature
        fields = ['id',
                  'visual_spec_document_id',
                  'feature_id', 'annotation_ids']

    def to_representation(self, obj, *args, **kwargs):
        obj.annotation_ids = obj.visual_spec_feature_annotations.values_list('id', flat=True)
        return super(VisualSpecFeatureSerializer, self).to_representation(obj, *args, **kwargs)
