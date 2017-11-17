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
    reason_name = serializers.CharField()

    class Meta:
        model = Nudge
        fields = ('id', 'user_id', 'sprint_id', 'issue_id', 'reason_name',
                  'reason', 'nudginess_percent', 'project_id')

    def to_representation(self, nudge, *args, **kwargs):
        nudge.reason_name = dict(Nudge.NUDGE_REASONS)[nudge.reason]
        return super(NudgeSerializer, self).to_representation(nudge, *args, **kwargs)

        
