import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)

class FeatureSerializer(BaseSerializer):

    id = serializers.CharField()
    number = serializers.CharField()
    name = serializers.CharField()
    project_id = serializers.CharField()
    description = serializers.CharField()
    created = serializers.DateTimeField()

    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        return super(FeatureSerializer, self).__init__(*args, **kwargs)
