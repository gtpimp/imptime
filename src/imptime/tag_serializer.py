import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)


class TagSerializer(BaseSerializer):

    name = serializers.CharField()
    category_name = serializers.CharField(source="category.name")
