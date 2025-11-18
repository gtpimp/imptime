import logging
from .base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import VisualSpecFeature
logger = logging.getLogger(__name__)

class VisualSpecFeatureSerializer(BaseModelSerializer):
    id = serializers.CharField(required=False)
    annotated_visual_spec_document_id = serializers.CharField()
    feature_id = serializers.CharField(required=False)

    class Meta:
        model = VisualSpecFeature
        fields = ['id',
                  'annotated_visual_spec_document_id',
                  'feature_id']
