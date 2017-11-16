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

    class Meta:
        model = Nudge
        fields = ('id', 'user_id', 'sprint_id', 'issue_id', 'reason', 'nudginess_percent')
