import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class TestableStepSerializer(BaseSerializer):
    id = serializers.CharField()
    instruction = serializers.CharField()
    order = serializers.IntegerField()
    refers_to_testable_id = serializers.CharField()

class TestableSerializer(BaseSerializer):
    id = serializers.CharField()
    steps = serializers.CharField()
    enriched_steps = serializers.CharField()
    name = serializers.CharField()
    quality_error = serializers.CharField()
    testable_steps = serializers.ListField(TestableStepSerializer, source="testable_steps_in_order")
    implementing_issue_ids = serializers.ListField(serializers.CharField())
    feature_ids = serializers.ListField(serializers.CharField())

    def to_representation(self, obj, *args, **kwargs):
        obj.name = obj.name or "Testable %s" % obj.order
        obj.steps = self.convert_list_to_numbered_list(obj.steps)
        obj.implementing_issue_ids = [x.id for x in obj.implementing_issues.all()]

        steps = [x for x in obj.testable_steps.all()]
        steps.sort(key=lambda x: x.order)
        obj.testable_steps_in_order = steps
        obj.feature_ids = [x.id for x in obj.features.all()]
        
        return super(TestableSerializer, self).to_representation(obj, *args, **kwargs)

    def get_modified(self, obj):
        return obj.created.strftime('%b, %d, %Y, %I:%M %p')

    def convert_list_to_numbered_list(self, steps):
        if not steps or len(steps) == 0:
            return steps
        if steps[0] == "-":
            steps = "1." + steps[1:]
        steps = steps.replace("\n-", "\n1.")
        return steps
        


    
