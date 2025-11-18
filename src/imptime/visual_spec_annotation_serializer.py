import logging
from .base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import VisualSpecAnnotation
logger = logging.getLogger(__name__)

class VisualSpecAnnotationInboundSerializer(BaseModelSerializer):
    class Meta:
        model = VisualSpecAnnotation
        fields = ['shape',
                  'x_pos',
                  'y_pos']


class VisualSpecAnnotationSerializer(BaseModelSerializer):
    id = serializers.CharField()
    annotated_visual_spec_document_id = serializers.CharField()
    
    class Meta:
        model = VisualSpecAnnotation
        fields = ['id',
                  'annotated_visual_spec_document_id',
                  'shape',
                  'x_pos',
                  'y_pos',
                  'x_offset_to_target',
                  'y_offset_to_target']

