import logging
from rest_framework import serializers
from base_serializer import BaseModelSerializer
from timepiece.models import Business as Sprint
logger = logging.getLogger(__name__)


class SprintSerializer(BaseModelSerializer):

    class Meta:
        model = Sprint
        fields = ('id', 'name')

    id = serializers.CharField()
