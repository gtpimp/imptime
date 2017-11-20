import logging
from base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import VisualSpecIssue
from rest_framework.reverse import reverse
logger = logging.getLogger(__name__)

class VisualSpecIssueAnnotationSerializer(BaseModelSerializer):
    id = serializers.CharField()
    issue_id = serializers.CharField()
    
    class Meta:
        model = VisualSpecIssue
        fields = ['id',
                  'issue_id',
                  'shape',
                  'x_pos',
                  'y_pos']

class VisualSpecIssueSerializer(BaseModelSerializer):
    id = serializers.CharField(required=False)
    visual_spec_document_id = serializers.CharField()
    issue_id = serializers.CharField(required=False)
    annotation_ids = serializers.ListField(child=VisualSpecIssueAnnotationSerializer())

    class Meta:
        model = VisualSpecIssue
        fields = ['id',
                  'visual_spec_document_id',
                  'issue_id', 'annotation_ids']

    def to_representation(self, obj, *args, **kwargs):
        obj.annotation_ids = obj.visual_spec_issue_annotations.values_list('id', flat=True)
        return super(VisualSpecIssueSerializer, self).to_representation(obj, *args, **kwargs)
