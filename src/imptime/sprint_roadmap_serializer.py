import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from clock_entry_serializer import ClockEntrySerializer
from timepiece.models import Entry
from imptime.models import SprintTemplate
from timepiece.models import ProjectDeadline as SprintDeadline
logger = logging.getLogger(__name__)

class SprintRoadmapSerializer(BaseSerializer):

    id = serializers.CharField()
    sprint_id = serializers.CharField(source="id")
    project_id = serializers.CharField(source="business_id") #sic
    first_entry = ClockEntrySerializer()
    last_entry = ClockEntrySerializer()
    num_issues = serializers.IntegerField()
    sprint_type = serializers.CharField(source="project_type")
    deadline_ids = serializers.ListField(child=serializers.CharField(), source="ordered_deadline_ids")
    first_deadline_at = serializers.DateTimeField()
    last_deadline_at = serializers.DateTimeField()

    def to_representation(self, sprint_roadmap, *args, **kwargs):
        sprint_roadmap.first_entry = Entry.objects.filter(issue__project_id=sprint_roadmap.id).order_by('start_time').first()
        sprint_roadmap.last_entry = Entry.objects.filter(issue__project_id=sprint_roadmap.id).order_by('-end_time').first()

        sprint_roadmap.ordered_deadline_ids = sprint_roadmap.deadlines.order_by("deadline").values_list('id', flat=True)

        first_deadline = SprintDeadline.objects.filter(project_id=sprint_roadmap.id).order_by("deadline").first()
        sprint_roadmap.first_deadline_at = first_deadline.deadline if first_deadline else None

        last_deadline = SprintDeadline.objects.filter(project_id=sprint_roadmap.id).order_by("deadline").last()
        sprint_roadmap.last_deadline_at = last_deadline.deadline if last_deadline else None
        
        return super(SprintRoadmapSerializer, self).to_representation(sprint_roadmap, *args, **kwargs)
