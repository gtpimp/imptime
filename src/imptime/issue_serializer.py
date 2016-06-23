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
    feature = serializers.CharField()

    def to_representation(self, issue, *args, **kwargs):
        issue.assigned_to_quick_name = \
            issue.assigned_to.username if issue.assigned_to_id else None
        issue.feature = issue.feature.name if issue.feature_id else None

        d = super(IssueSerializer, self).to_representation(
            issue, *args, **kwargs)
        return d


class IssueGeneralDetailsSerializer(BaseModelSerializer):
    class Meta:
        model = Issue
        fields = ('id', 'number', 'subject', 'description', 'assigned_to_id')
