import logging
from rest_framework import serializers
from base_serializer import BaseModelSerializer
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

    class Meta:
        model = Nudge 
        fields = ('id', 'user_id', 'sprint_id', 'issue_id',
                  'description', 'due_date', 'due_date_reason',
                  'reason', 'project_id', 'modified', 'issue_status')
