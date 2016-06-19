import logging
from rest_framework import serializers
from base_serializer import BaseModelSerializer
from timepiece.models import Issue
logger = logging.getLogger(__name__)


class IssueSerializer(BaseModelSerializer):

    class Meta:
        model = Issue
        fields = ('id', 'number', 'subject', 'description', 'assigned_to')

    id = serializers.CharField()


class IssueGeneralDetailsSerializer(BaseModelSerializer):
    class Meta:
        model = Issue
        fields = ('id', 'number', 'subject', 'description', 'assigned_to')
