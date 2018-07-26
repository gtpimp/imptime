import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)
    
class IssueHistorySerializer(BaseSerializer):
    id = serializers.CharField()
    issue_id = serializers.CharField()
    created_by_user_id = serializers.CharField(source="created_by_id")
    created_at = serializers.DateTimeField()
    description = serializers.CharField()
    before = serializers.CharField()
    after = serializers.CharField()
