import logging
from base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import VisualSpecFeatureAnnotation
logger = logging.getLogger(__name__)

class VisualSpecFeatureAnnotationInboundSerializer(BaseModelSerializer):
    class Meta:
        model = VisualSpecFeatureAnnotation
        fields = ['shape',
                  'x_pos',
                  'y_pos']


class VisualSpecFeatureAnnotationSerializer(BaseModelSerializer):
    id = serializers.CharField()
    
    class Meta:
        model = VisualSpecFeatureAnnotation
        fields = ['id',
                  'shape',
                  'x_pos',
                  'y_pos',
                  'x_offset_to_target',
                  'y_offset_to_target']

