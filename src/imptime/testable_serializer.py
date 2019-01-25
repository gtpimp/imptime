import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class TestableSerializer(BaseSerializer):
    id = serializers.CharField()
    name = serializers.CharField()
    quality_error = serializers.CharField()
    testable_line_ids = serializers.ListField(serializers.CharField())
    implementing_issue_ids = serializers.ListField(serializers.CharField())
    feature_ids = serializers.ListField(serializers.CharField())

    def to_representation(self, obj, *args, **kwargs):
        obj.name = obj.name or "Testable %s" % obj.order
        obj.implementing_issue_ids = [x.id for x in obj.implementing_issues.all()]
        obj.testable_line_ids = obj.testable_lines.all().order_by("order").values_list("id", flat=True)

        lines = [x for x in obj.testable_lines.all()]
        lines.sort(key=lambda x: x.order)
        obj.testable_lines_in_order = lines
        obj.feature_ids = [x.id for x in obj.features.all()]
        
        return super(TestableSerializer, self).to_representation(obj, *args, **kwargs)

    def get_modified(self, obj):
        return obj.created.strftime('%b, %d, %Y, %I:%M %p')
