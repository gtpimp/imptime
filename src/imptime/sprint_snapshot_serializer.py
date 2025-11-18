import logging
from rest_framework import serializers
from .base_serializer import BaseSerializer
from imptime.models import SprintSnapshot
from timepiece.models import BusinessPermissions as ProjectPermissions
import json
logger = logging.getLogger(__name__)

class SprintSnapshotSerializer(BaseSerializer):
    id = serializers.CharField()
    sprint_id = serializers.CharField()
    project_id = serializers.CharField(source="sprint.business_id")
    created_at = serializers.DateTimeField(source='created')
    description = serializers.CharField()
    cost_summary = serializers.JSONField(binary=True)
    time_summary = serializers.JSONField(binary=True)
    estimate_time_summary = serializers.JSONField(binary=True)
    project_statement = serializers.JSONField(binary=True)
    affected_entities = serializers.JSONField(binary=True)

    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        super(SprintSnapshotSerializer, self).__init__(*args, **kwargs)
    
    def to_representation(self, obj):
        obj = SprintSnapshot.clean_snapshot(obj,
                                            sprint_id=obj.sprint_id,
                                            user=self.logged_in_user)
        obj.cost_summary = json.loads(obj.cost_summary or "null")
        obj.project_statement = json.loads(obj.project_statement or "null")
        obj.time_summary = json.loads(obj.time_summary or "null")
        obj.estimate_time_summary = json.loads(obj.estimate_time_summary or "null")
        obj.affected_entities = json.loads(obj.affected_entities or "null")

        return super(SprintSnapshotSerializer, self).to_representation(obj)
