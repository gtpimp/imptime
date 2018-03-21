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

    def __init__(self, *args, **kwargs):
        self.can_view_billable_amount=kwargs.pop('can_view_billable_amount', False)
        self.can_view_velocity=kwargs.pop('can_view_velocity', False)
        super(SprintUserRateSerializer, self).__init__(*args, **kwargs)
        
    
    def to_representation(self, rate, *args, **kwargs):
        rate.sprint_id = rate.project_id # sic
        if not self.can_view_billable_amount:
            rate.sanitize_rate()
        if not self.can_view_velocity:
            rate.velocity = None
        return super(SprintUserRateSerializer, self).to_representation(rate, *args, **kwargs)
