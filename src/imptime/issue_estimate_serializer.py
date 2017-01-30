import logging
from rest_framework import serializers
from django.utils import timezone
from drf_compound_fields.fields import ListField
from base_serializer import BaseSerializer, BaseModelSerializer
from tag_serializer import TagSerializer
from user_serializer import UserSerializer
from timepiece.models import Issue, IssuePoints
logger = logging.getLogger(__name__)


class IssueEstimateSerializer(BaseSerializer):
    user = UserSerializer(many=False)
    estimate_hours = serializers.FloatField(source="points")
    
