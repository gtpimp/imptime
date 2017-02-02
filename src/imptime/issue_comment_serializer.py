import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class IssueCommentSerializer(BaseSerializer):
    id = serializers.CharField()
    comment = serializers.CharField()
    author_id = serializers.CharField()
    created = serializers.DateTimeField()
    modified = serializers.DateTimeField()


