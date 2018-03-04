import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from clock_entry_serializer import ClockEntrySerializer
from timepiece.models import Entry
from imptime.models import SprintTemplate
from timepiece.models import ProjectDeadline as SprintDeadline
from imptime.helpers import estimate_helper
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
    fastest_estimated_hours = serializers.FloatField()
    slowest_estimated_hours = serializers.FloatField()

    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        super(SprintRoadmapSerializer, self).__init__(*args, **kwargs)
    
    def to_representation(self, sprint_roadmap, *args, **kwargs):
        sprint_roadmap.first_entry = Entry.objects.filter(issue__project_id=sprint_roadmap.id).order_by('start_time').first()
        sprint_roadmap.last_entry = Entry.objects.filter(issue__project_id=sprint_roadmap.id).order_by('-end_time').first()

        sprint_roadmap.ordered_deadline_ids = sprint_roadmap.deadlines.order_by("deadline").values_list('id', flat=True)

        first_deadline = SprintDeadline.objects.filter(project_id=sprint_roadmap.id).order_by("deadline").first()
        sprint_roadmap.first_deadline_at = first_deadline.deadline if first_deadline else None

        last_deadline = SprintDeadline.objects.filter(project_id=sprint_roadmap.id).order_by("deadline").last()
        sprint_roadmap.last_deadline_at = last_deadline.deadline if last_deadline else None

        sprint = sprint_roadmap
        comparative_estimates = estimate_helper.get_comparative_estimates(sprint, self.logged_in_user)
        if len(comparative_estimates) > 0 and comparative_estimates['1aggregates']['fastest_user_id'] is not None:
            fastest_user_id = comparative_estimates['aggregates']['fastest_user_id']
            slowest_user_id = comparative_estimates['aggregates']['slowest_user_id']
            sprint_roadmap.fastest_estimated_hours = comparative_estimates['by_user'][fastest_user_id]['total_hours']
            sprint_roadmap.slowest_estimated_hours = comparative_estimates['by_user'][slowest_user_id]['total_hours']
        else:
            sprint_roadmap.fastest_estimated_hours = 0
            sprint_roadmap.slowest_estimated_hours = 0

        return super(SprintRoadmapSerializer, self).to_representation(sprint_roadmap, *args, **kwargs)
