import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)


class TagSerializer(BaseSerializer):

    name = serializers.CharField(source="tag.name")
    category_name = serializers.CharField(source="tag.category.name")
    issue_number = serializers.CharField(source="issue.number")
