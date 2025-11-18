import logging
from rest_framework import serializers
from .base_serializer import BaseSerializer
logger = logging.getLogger(__name__)


class TagSerializer(BaseSerializer):
    id = serializers.CharField()
    name = serializers.CharField()
    category_id = serializers.CharField(source="category.id")
    category_name = serializers.CharField(source="category.name")
