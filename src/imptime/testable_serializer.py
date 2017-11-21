import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class TestableSerializer(BaseSerializer):
    id = serializers.CharField(source="pk")
    steps = serializers.CharField()
    name = serializers.CharField()
    quality_error = serializers.CharField()

    def to_representation(self, obj, *args, **kwargs):
        obj.name = "Testable %s" % obj.order
        obj.steps = self.convert_list_to_numbered_list(obj.steps)
        return super(TestableSerializer, self).to_representation(obj, *args, **kwargs)

    def get_modified(self, obj):
        return obj.created.strftime('%b, %d, %Y, %I:%M %p')

    def convert_list_to_numbered_list(self, steps):
        if steps[0] == "-":
            steps = "1." + steps[1:]
        steps = steps.replace("\n-", "\n1.")
        return steps
        
