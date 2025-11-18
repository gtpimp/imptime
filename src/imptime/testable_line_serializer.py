import logging
from .base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class TestableLineSerializer(BaseSerializer):
    id = serializers.CharField()
    instruction = serializers.CharField()
    order = serializers.IntegerField()
    refers_to_testable_id = serializers.CharField()
