import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class MarkdownEnrichmentSerializer(BaseSerializer):

    readable_name = serializers.CharField()
    status = serializers.CharField()
    sprint_name = serializers.CharField()
    sprint_status = serializers.CharField()
    issue_modified = serializers.DateTimeField()

