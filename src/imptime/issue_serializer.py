import logging
from rest_framework import serializers
from base_serializer import BaseModelSerializer
from timepiece.models import Issue
logger = logging.getLogger(__name__)


class IssueSerializer(BaseModelSerializer):

    class Meta:
        model = Issue
        fields = ('id', 'number', 'subject', 'description', 'assigned_to',
                  'feature', 'status')

    id = serializers.CharField()

    def to_representation(self, issue, *args, **kwargs):
        d = super(IssueSerializer, self).to_representation(
            issue, *args, **kwargs)
        d['feature_name'] = issue.feature.name if issue.feature else None
        d['assigned_to_username'] = \
            issue.assigned_to.username if issue.assigned_to else None
        return d


class IssueGeneralDetailsSerializer(BaseModelSerializer):
    class Meta:
        model = Issue
        fields = ('id', 'number', 'subject', 'description', 'assigned_to')
