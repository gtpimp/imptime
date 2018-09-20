import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)

class FeatureSerializer(BaseSerializer):

    id = serializers.CharField()
    number = serializers.CharField()
    name = serializers.CharField()
    parent_id = serializers.CharField()
    children_ids = serializers.CharField()
    project_id = serializers.CharField()
    description = serializers.CharField()
    created = serializers.DateTimeField()
    is_root_node = serializers.BooleanField()
    
    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        return super(FeatureSerializer, self).__init__(*args, **kwargs)

    def to_representation(self, feature, *args, **kwargs):
        feature.children_ids = [ x.id for x in feature.children.all() ]
        feature.is_root_node = feature.parent_id is None
        return super(FeatureSerializer, self).to_representation(feature, *args, **kwargs)
    
