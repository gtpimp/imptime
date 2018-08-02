import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)

class SprintSnapshotSerializer(BaseSerializer):
    id = serializers.CharField()
    description = serializers.CharField()
    sprint_id = serializers.CharField()
