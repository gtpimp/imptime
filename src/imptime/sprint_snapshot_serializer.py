import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from imptime.models import SprintSnapshot
import json
logger = logging.getLogger(__name__)

class SprintSnapshotSerializer(BaseSerializer):
    id = serializers.CharField()
    sprint_id = serializers.CharField()
    project_id = serializers.CharField(source="sprint.business_id")
    created_at = serializers.DateTimeField(source='created')
    description = serializers.CharField()
    cost_summary = serializers.JSONField(binary=True)

    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        super(SprintSnapshotSerializer, self).__init__(*args, **kwargs)
    
    def to_representation(self, obj):
        obj.cost_summary = SprintSnapshot.clean_cost_summary(json.loads(obj.cost_summary or "null"),
                                                             sprint_id=obj.sprint_id,
                                                             user=self.logged_in_user)
        return super(SprintSnapshotSerializer, self).to_representation(obj)
