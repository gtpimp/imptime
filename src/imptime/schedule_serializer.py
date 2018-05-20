import logging
from rest_framework import serializers
from base_serializer import BaseModelSerializer
from imptime.models import Schedule, ScheduleItem
logger = logging.getLogger(__name__)

class ScheduleSerializer(BaseModelSerializer):
    
    id = serializers.CharField()
    name = serializers.CharField()
    owner_id = serializers.CharField()
    viewer_user_ids = serializers.ListField(child=serializers.CharField())
    editor_user_ids = serializers.ListField(child=serializers.CharField())
    modified = serializers.DateTimeField()
    created = serializers.DateTimeField()

    class Meta:
        model = Schedule 
        fields = ('id', 'name', 'owner_id', 'viewer_user_ids',
                  'editor_user_ids', 'modified', 'created')

    def to_representation(self, obj, *args, **kwargs):
        obj.viewer_user_ids = obj.viewers.values_list('id', flat=True)
        obj.editor_user_ids = obj.editors.values_list('id', flat=True)
        return super(ScheduleSerializer, self).to_representation(obj, *args, **kwargs)
        
class ScheduleItemSerializer(BaseModelSerializer):
    
    id = serializers.CharField()
    schedule_id = serializers.CharField()
    order = serializers.IntegerField()
    issue_id = serializers.CharField()
    sprint_id = serializers.CharField()
    project_id = serializers.CharField(source="sprint.business_id") #sic
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
    duration_hours = serializers.FloatField()
    modified = serializers.DateTimeField()
    
    class Meta:
        model = ScheduleItem
        fields = ('id', 'schedule_id', 'order', 'issue_id',
                  'sprint_id', 'project_id',
                  'start_at', 'end_at', 'duration_hours', 'modified')
