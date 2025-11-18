import logging
from rest_framework import serializers
from .base_serializer import BaseModelSerializer, BaseSerializer
from imptime.models import ScheduleItem
logger = logging.getLogger(__name__)

class ScheduleItemSerializer(BaseModelSerializer):
    
    id = serializers.CharField()
    schedule_id = serializers.CharField()
    order = serializers.IntegerField()
    issue_id = serializers.CharField()
    sprint_id = serializers.CharField()
    project_id = serializers.CharField()
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
    duration_hours = serializers.FloatField()
    modified = serializers.DateTimeField()
    
    class Meta:
        model = ScheduleItem
        fields = ('id', 'schedule_id', 'order', 'issue_id',
                  'sprint_id', 'project_id',
                  'start_at', 'end_at', 'duration_hours', 'modified')
        
class ScheduleItemCreateSerializer(BaseSerializer):
    schedule_id = serializers.CharField()
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
    issue_id = serializers.CharField(required=False)
    sprint_id = serializers.CharField(required=False)
    project_id = serializers.CharField(required=False)
    
    
class ScheduleItemUpdateDatesSerializer(BaseSerializer):
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
