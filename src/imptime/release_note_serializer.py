import logging
from rest_framework import serializers
from .base_serializer import BaseSerializer
from timepiece.models import GlobalPermissions
logger = logging.getLogger(__name__)

class ReleaseNoteSerializer(BaseSerializer):
    
    id = serializers.CharField()
    header = serializers.CharField()
    content = serializers.CharField()
    created_at = serializers.DateTimeField(source='created')
    seen_by_user_ids = serializers.ListField(child=serializers.CharField())

    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        super(ReleaseNoteSerializer, self).__init__(*args, **kwargs)
    
    def to_representation(self, obj, *args, **kwargs):
        if GlobalPermissions().has_update_release_notes_permission(self.logged_in_user):
            obj.seen_by_user_ids = obj.seen_by.all().values_list('seen_by_id', flat=True)
        else:
            obj.seen_by_user_ids = None
        return super(ReleaseNoteSerializer, self).to_representation(obj, *args, **kwargs)
    
