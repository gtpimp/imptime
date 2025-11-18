import logging
from rest_framework import serializers
from .base_serializer import BaseSerializer
logger = logging.getLogger(__name__)


class IssueStatusSerializer(BaseSerializer):
    name = serializers.CharField()
