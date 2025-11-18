import logging
from .base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class IssueCommentSerializer(BaseSerializer):
    id = serializers.CharField(source="pk")
    comment = serializers.CharField()
    enriched_comment = serializers.CharField()
    author_id = serializers.CharField()
    created = serializers.DateTimeField()
    modified = serializers.SerializerMethodField()
    comment_type = serializers.CharField()
    share_ref = serializers.CharField()
    share_ref_expiry = serializers.DateTimeField()

    def to_representation(self, obj, *args, **kwargs):
        return super(IssueCommentSerializer, self).to_representation(obj, *args, **kwargs)

    def get_modified(self, obj):
        return obj.created.strftime('%b, %d, %Y, %I:%M %p')

class IssueShareCommentSerializer(IssueCommentSerializer):
    pass
