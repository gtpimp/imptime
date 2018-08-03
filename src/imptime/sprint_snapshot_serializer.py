import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
import json
logger = logging.getLogger(__name__)

class SprintSnapshotSerializer(BaseSerializer):
    id = serializers.CharField()
    sprint_id = serializers.CharField()
    project_id = serializers.CharField(source="sprint.business_id")
    created_at = serializers.DateTimeField(source='created')
    description = serializers.CharField()
    cost_summary = serializers.CharField()

    def to_representation(self, obj):
        obj.cost_summary = json.loads(obj.cost_summary or "null")
        return super(SprintSnapshotSerializer, self).to_representation(obj)
    
