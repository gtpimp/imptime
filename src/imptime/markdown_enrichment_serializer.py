import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class MarkdownEnrichmentSerializer(BaseSerializer):

    issue_number = serializers.CharField()
    issue_status = serializers.CharField()
    issue_subject = serializers.CharField()    
    issue_modified = serializers.DateTimeField()
    sprint_name = serializers.CharField()
    sprint_status = serializers.CharField()

