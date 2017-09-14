import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class TestableSerializer(BaseSerializer):
    id = serializers.CharField(source="pk")
    steps = serializers.CharField()

    def to_representation(self, obj, *args, **kwargs):
        return super(TestableSerializer, self).to_representation(obj, *args, **kwargs)

    def get_modified(self, obj):
        return obj.created.strftime('%b, %d, %Y, %I:%M %p')
