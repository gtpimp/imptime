import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from clock_entry_serializer import ClockEntrySerializer
from timepiece.models import Entry
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

    def to_representation(self, sprint, *args, **kwargs):
        sprint.status_name = sprint.status3.name
        sprint.first_entry = Entry.objects.filter(issue__project_id=sprint.id).order_by('start_time').first()
        sprint.last_entry = Entry.objects.filter(issue__project_id=sprint.id).order_by('-end_time').first()
        
        return super(SprintSerializer, self).to_representation(
            sprint, *args, **kwargs)
