import logging
from rest_framework import serializers
from base_serializer import BaseSerializer, BaseModelSerializer
logger = logging.getLogger(__name__)

class MienSerializer(BaseSerializer):

    id = serializers.CharField()
    title = serializers.CharField()
