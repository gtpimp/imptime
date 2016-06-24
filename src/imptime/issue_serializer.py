import logging
from rest_framework import serializers
from base_serializer import BaseSerializer, BaseModelSerializer
from timepiece.models import Issue
logger = logging.getLogger(__name__)


class IssueSerializer(BaseSerializer):

    id = serializers.CharField()
    assigned_to_quick_name = serializers.CharField()
    feature = serializers.CharField()
    subject = serializers.CharField()
    status = serializers.CharField()
    assigned_to_id = serializers.CharField()
    feature_name = serializers.CharField()
    number = serializers.IntegerField()
    position_if_creating_new_issue_after = serializers.IntegerField()

    def to_representation(self, issue, *args, **kwargs):
        issue.assigned_to_quick_name = \
            issue.assigned_to.username if issue.assigned_to_id else None

        issue.feature_name = issue.feature.name if issue.feature_id else None
        issue.position_if_creating_new_issue_after = issue.order + 0.5

        d = super(IssueSerializer, self).to_representation(
            issue, *args, **kwargs)
        return d


class IssueCommentSerializer(BaseSerializer):
    id = serializers.CharField()
    comment = serializers.CharField()
    author_id = serializers.CharField()
    created = serializers.DateTimeField()
    modified = serializers.DateTimeField()


class IssueGeneralDetailsSerializer(BaseSerializer):

    id = serializers.CharField()
    description = serializers.CharField()
    issue_comments = IssueCommentSerializer(many=True)

    def to_representation(self, issue, *args, **kwargs):
        issue.issue_comments = issue.comments.all().order_by("-created")
        return super(IssueGeneralDetailsSerializer, self)\
            .to_representation(issue, *args, **kwargs)
