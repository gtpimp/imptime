import logging
from base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import VisualSpecIssueAnnotation
logger = logging.getLogger(__name__)

class VisualSpecIssueAnnotationInboundSerializer(BaseModelSerializer):
    class Meta:
        model = VisualSpecIssueAnnotation
        fields = ['shape',
                  'x_pos',
                  'y_pos']


class VisualSpecIssueAnnotationSerializer(BaseModelSerializer):
    id = serializers.CharField()
    
    class Meta:
        model = VisualSpecIssueAnnotation
        fields = ['id',
                  'shape',
                  'x_pos',
                  'y_pos']

