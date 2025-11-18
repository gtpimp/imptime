import logging
from rest_framework import serializers
from .base_serializer import BaseModelSerializer
from imptime.models import Schedule
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
