import logging
from rest_framework import serializers
from django.utils import timezone
from drf_compound_fields.fields import ListField
from .base_serializer import BaseSerializer, BaseModelSerializer
logger = logging.getLogger(__name__)


class IssueEstimateSerializer(BaseSerializer):
    user_id = serializers.CharField()
    estimate_hours = serializers.FloatField(source="points")
    
class IssueHoursSerializer(BaseSerializer):
    user_id = serializers.CharField()
    hours = serializers.FloatField()
