import logging
from .base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class ClockEntrySerializer(BaseSerializer):
    id = serializers.CharField(source="pk")
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    hours = serializers.FloatField()
    user_id = serializers.CharField()
    comments = serializers.CharField()
    is_active = serializers.BooleanField()
    role_name = serializers.CharField(source="role.name")
    issue_id = serializers.CharField()
    sprint_id = serializers.CharField(source="issue.project_id") #sic
    project_id = serializers.CharField(source="issue.project.business_id") #sic
    
class ClockEntryUpdateSerializer(BaseSerializer):
    start_time = serializers.DateTimeField(allow_null=True, required=False)
    end_time = serializers.DateTimeField(allow_null=True, required=False)
    role_name = serializers.CharField(allow_null=True, required=False)
    description = serializers.CharField(allow_null=True, required=False, allow_blank=True)
    issue_id = serializers.CharField(allow_null=True, required=False)
    
class ClockEntryCreateSerializer(BaseSerializer):
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    description = serializers.CharField(allow_null=True, required=False, allow_blank=True)
    issue_id = serializers.CharField()
    
