import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class IssueAttachmentSerializer(BaseSerializer):
    id = serializers.CharField(source="pk")
    name = serializers.CharField()
    download_url = serializers.CharField(source='download_url')
    preview_url = serializers.CharField(source='preview_url')
    created = serializers.DateTimeField()
    modified = serializers.DateTimeField()

    def to_representation(self, obj, *args, **kwargs):
        return super(IssueAttachmentSerializer, self).to_representation(obj, *args, **kwargs)
