import logging
from rest_framework import serializers
from base_serializer import BaseModelSerializer
from timepiece.models import Business as Project
logger = logging.getLogger(__name__)


class ProjectSerializer(BaseModelSerializer):

    class Meta:
        model = Project
        fields = ('id', 'name')

    id = serializers.CharField()
