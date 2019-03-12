import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
from issue_history_serializer import IssueHistorySerializer
from clock_entry_serializer import ClockEntrySerializer
logger = logging.getLogger(__name__)

class EventLogFilterSerializer(BaseSerializer):
    project_id = serializers.IntegerField(required=True, allow_null=False)
    date_from_inclusive = serializers.DateTimeField(required=True, allow_null=False)
    date_to_inclusive = serializers.DateTimeField(required=True, allow_null=False)

class EventLogSerializer(BaseSerializer):
    id = serializers.IntegerField(required=True, allow_null=False)
    issue_histories = IssueHistorySerializer(many=True)
    clock_entries = ClockEntrySerializer(many=True)
    
