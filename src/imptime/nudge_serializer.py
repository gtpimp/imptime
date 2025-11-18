import logging
from rest_framework import serializers
from .base_serializer import BaseModelSerializer
from imptime.models import Nudge
logger = logging.getLogger(__name__)

class NudgeSerializer(BaseModelSerializer):
    
    id = serializers.CharField()
    user_id = serializers.CharField()
    sprint_id = serializers.CharField()
    issue_id = serializers.CharField()
    project_id = serializers.CharField(source="sprint.business_id") #sic
    reason = serializers.CharField()
    modified = serializers.DateTimeField()
    issue_status = serializers.CharField(source="issue.status2.name")
    can_delete = serializers.BooleanField(source="is_manual")
    num_unnudged_issues_above = serializers.IntegerField()

    class Meta:
        model = Nudge 
        fields = ('id', 'user_id', 'sprint_id', 'issue_id',
                  'description', 'due_date', 'due_date_reason',
                  'estimated_start_at', 'estimated_end_at', 'estimated_hours',
                  'reason', 'project_id', 'modified', 'issue_status',
                  'can_delete', 'num_unnudged_issues_above')
