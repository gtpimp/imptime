import logging
from rest_framework import serializers
from .base_serializer import BaseSerializer, BaseModelSerializer
from timepiece.models import ProjectDeadline as SprintDeadline
from timepiece.models import ProjectDeadlineType as SprintDeadlineType
from timepiece.models import Project as Sprint
from timepiece.models import Business as Project
from lib import date_helper
logger = logging.getLogger(__name__)

class SprintDeadlineSerializer(BaseSerializer):

    id = serializers.CharField()
    sprint_id = serializers.CharField(source="project_id")
    deadline_type_id = serializers.CharField(source="deadline_type.id")
    deadline_type_name = serializers.CharField(source="deadline_type.name")
    deadline = serializers.DateTimeField(input_formats=['iso-8601'])
    description = serializers.CharField()
    is_hard_deadline = serializers.BooleanField()
    represents_sprint_start = serializers.BooleanField(source="represents_project_start")
    represents_sprint_end = serializers.BooleanField(source="represents_project_end")
    modified = serializers.DateTimeField(input_formats=['iso-8601'])

class SprintDeadlineModelSerializer(BaseModelSerializer):

    deadline = serializers.DateTimeField(input_formats=['iso-8601'])
    
    class Meta:
        model = SprintDeadline
        fields = ('project', #sic
                  'deadline_type',
                  'deadline',
                  'description',
                  'is_hard_deadline',
                  'represents_project_start',
                  'represents_project_end')
