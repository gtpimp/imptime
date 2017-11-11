import logging
from rest_framework import serializers
from base_serializer import BaseSerializer, BaseModelSerializer
from timepiece.models import ProjectDeadline as SprintDeadline
from timepiece.models import ProjectDeadlineType as SprintDeadlineType
from timepiece.models import Project as Sprint
from timepiece.models import Business as Project
logger = logging.getLogger(__name__)

class SprintDeadlineSerializer(BaseSerializer):

    id = serializers.CharField()
    project_id = serializers.CharField()
    deadline_type_name = serializers.CharField(source="deadline_type.name")
    deadline = serializers.DateTimeField()
    description = serializers.CharField()
    is_hard_deadline = serializers.BooleanField()
    represents_sprint_start = serializers.BooleanField(source="represents_project_start")
    represents_sprint_end = serializers.BooleanField(source="represents_project_end")

class SprintDeadlineModelSerializer(BaseModelSerializer):
    class Meta:
        model = SprintDeadline
        fields = ('business_id', #sic
                  'deadline_type',
                  'deadline',
                  'description',
                  'is_hard_deadline',
                  'represents_sprint_start',
                  'represents_sprint_end')

    def validate(self, validated_data):
        project_id = validated_data.pop('project_id')
        validated_data['business_id'] = project_id
        validated_data['deadline_type'] = SprintDeadlineType.objects.get(business_id=project_id, #sic
                                                                         name=validated_data.pop('deadline_type_name'))
        return validated_data
