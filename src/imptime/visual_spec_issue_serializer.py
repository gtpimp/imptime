import logging
from .base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import VisualSpecIssue
logger = logging.getLogger(__name__)

class VisualSpecIssueSerializer(BaseModelSerializer):
    id = serializers.CharField(required=False)
    annotated_visual_spec_document_id = serializers.CharField()
    issue_id = serializers.CharField(required=False)

    class Meta:
        model = VisualSpecIssue
        fields = ['id',
                  'annotated_visual_spec_document_id',
                  'issue_id']
