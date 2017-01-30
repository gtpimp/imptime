import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)


class SprintSerializer(BaseSerializer):

    id = serializers.CharField()
    number = serializers.CharField()
    name = serializers.CharField()
    status_name = serializers.CharField()
    project_id = serializers.CharField(source="business_id") #sic

    def to_representation(self, sprint, *args, **kwargs):
        sprint.status_name = sprint.status2
        return super(SprintSerializer, self).to_representation(
            sprint, *args, **kwargs)
