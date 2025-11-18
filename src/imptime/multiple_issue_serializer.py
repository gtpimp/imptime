import logging
from .base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class MultipleIssueFilterSerializer(BaseSerializer):
    sprint_ids = serializers.ListField(child=serializers.IntegerField(required=False, allow_null=True), allow_null=True, required=False)
    issue_ids = serializers.ListField(child=serializers.IntegerField(required=False, allow_null=True), allow_null=True, required=False)
    
