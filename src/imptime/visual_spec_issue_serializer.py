import logging
from base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import VisualSpecIssue
from rest_framework.reverse import reverse
logger = logging.getLogger(__name__)

class VisualSpecIssueSerializer(BaseModelSerializer):
    id = serializers.CharField(required=False)
    visual_spec_document_id = serializers.CharField()
    issue_id = serializers.CharField(required=False)

    class Meta:
        model = VisualSpecIssue
        fields = ['id',
                  'visual_spec_document_id',
                  'issue_id',
                  'order',
                  'shape',
                  'x_pos',
                  'y_pos']
