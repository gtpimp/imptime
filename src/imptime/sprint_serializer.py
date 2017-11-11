import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from clock_entry_serializer import ClockEntrySerializer
from timepiece.models import Entry
from imptime.models import SprintTemplate
from sprint_deadline_serializer import SprintDeadlineSerializer
logger = logging.getLogger(__name__)

class SprintSerializer(BaseSerializer):

    id = serializers.CharField()
    number = serializers.CharField()
    name = serializers.CharField()
    status_name = serializers.CharField()
    project_id = serializers.CharField(source="business_id") #sic
    description = serializers.CharField()
    first_entry = ClockEntrySerializer()
    last_entry = ClockEntrySerializer()
    created = serializers.DateTimeField()
    num_issues = serializers.IntegerField()
    sprint_type = serializers.CharField(source="project_type")
    sprint_template_id = serializers.CharField(source="cloned_from_sprint_id")
    sprint_clone_ids = serializers.ListField(child=serializers.CharField())
    deadlines = serializers.ListField(child=SprintDeadlineSerializer(), source="ordered_deadlines")

    def to_representation(self, sprint, *args, **kwargs):
        sprint.status_name = sprint.status3 and sprint.status3.name
        sprint.first_entry = Entry.objects.filter(issue__project_id=sprint.id).order_by('start_time').first()
        sprint.last_entry = Entry.objects.filter(issue__project_id=sprint.id).order_by('-end_time').first()

        sprint_template = sprint.parent_sprint_templates.all().first()
        if sprint_template:
            sprint.cloned_from_sprint_id = sprint_template.sprint_id
        else:
            sprint.cloned_from_sprint_id = None

        sprint.sprint_clone_ids = SprintTemplate.objects.filter(sprint=sprint).values_list('clones__id', flat=True)
        sprint.ordered_deadlines = sprint.deadlines.order_by("deadline")
            
        return super(SprintSerializer, self).to_representation(
            sprint, *args, **kwargs)
