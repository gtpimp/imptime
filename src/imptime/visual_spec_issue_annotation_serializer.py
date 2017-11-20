import logging
from base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import VisualSpecIssueAnnotation
logger = logging.getLogger(__name__)

class VisualSpecIssueAnnotationSerializer(BaseModelSerializer):
    id = serializers.CharField()
    issue_id = serializers.CharField()
    
    class Meta:
        model = VisualSpecIssueAnnotation
        fields = ['id',
                  'issue_id',
                  'shape',
                  'x_pos',
                  'y_pos']

