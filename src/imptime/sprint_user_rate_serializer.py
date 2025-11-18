import logging
from rest_framework import serializers
from .base_serializer import BaseSerializer
logger = logging.getLogger(__name__)

class SprintUserRateSerializer(BaseSerializer):

    id = serializers.CharField()
    sprint_id = serializers.CharField()
    user_id = serializers.CharField()
    billable_amount = serializers.FloatField()
    billable_amount_with_commission = serializers.FloatField()
    velocity = serializers.FloatField()
    work_ratio = serializers.FloatField()
    time_tracking_mode = serializers.CharField()

    def __init__(self, *args, **kwargs):
        self.can_view_billable_amount=kwargs.pop('can_view_billable_amount', False)
        self.can_view_velocity=kwargs.pop('can_view_velocity', False)
        self.can_view_time_tracking_mode=kwargs.pop('can_view_time_tracking_mode', False)
        self.can_view_commission = kwargs.pop('can_view_commission', False)
        super(SprintUserRateSerializer, self).__init__(*args, **kwargs)
        
    
    def to_representation(self, rate, *args, **kwargs):
        rate.sprint_id = rate.project_id # sic
        if not self.can_view_billable_amount:
            rate.sanitize_rate()
        if not self.can_view_velocity:
            rate.velocity = None
        if not self.can_view_time_tracking_mode:
            rate.time_tracking_mode = None
        if self.can_view_commission:
            rate.billable_amount_with_commission = rate.full_rate
        else:
            rate.billable_amount_with_commission = rate.billable_amount
            
        return super(SprintUserRateSerializer, self).to_representation(rate, *args, **kwargs)
