import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)

class ReleaseNoteSerializer(BaseSerializer):
    
    id = serializers.CharField()
    header = serializers.CharField()
    content = serializers.CharField()
    created_at = serializers.DateTimeField(source='created')

    
