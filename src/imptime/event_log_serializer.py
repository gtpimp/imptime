import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class EventLogFilterSerializer(BaseSerializer):
    project_id = serializers.IntegerField(required=True, allow_null=False)
    
