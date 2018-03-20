import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)

class SprintUserRateSerializer(BaseSerializer):

    id = serializers.CharField()
    sprint_id = serializers.CharField()
    user_id = serializers.CharField()
    billable_amount = serializers.FloatField()
    velocity = serializers.FloatField()
    work_ratio = serializers.FloatField()
    time_tracking_mode = serializers.CharField()

    def to_representation(self, rate, *args, **kwargs):
        rate.sprint_id = rate.project_id # sic
        return super(SprintUserRateSerializer, self).to_representation(rate, *args, **kwargs)
