import logging
from rest_framework import serializers
from .base_serializer import BaseSerializer
import json
logger = logging.getLogger(__name__)

class MienHeaderSerializer(BaseSerializer):
    key = serializers.CharField()
    label = serializers.CharField()
    description = serializers.CharField()
    width = serializers.CharField()
    flex = serializers.CharField(required=False)


class MienSerializer(BaseSerializer):
    id = serializers.CharField()
    title = serializers.CharField()
    headers = serializers.DictField(child=serializers.ListField(child=MienHeaderSerializer()), source="headers_by_name")
    features = serializers.ListField(child=serializers.CharField(), source="features_as_obj")

    def to_representation(self, obj):
        obj.features_as_obj = json.loads(obj.features or "null")
        obj.headers_by_name = dict([k, json.loads(v or "null")] for k,v in obj.headers.all().values_list("name", "headers"))
        return super(MienSerializer, self).to_representation(obj)
