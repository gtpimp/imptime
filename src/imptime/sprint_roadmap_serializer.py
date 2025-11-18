import logging
from rest_framework import serializers
import itertools
from dateutil.relativedelta import relativedelta
from .base_serializer import BaseSerializer
from django.db.models import Count, Min, Max
from django.utils import timezone
from .clock_entry_serializer import ClockEntrySerializer
from timepiece.models import Entry, Issue
from lib import chart_helper
logger = logging.getLogger(__name__)

class SprintRoadmapSerializer(BaseSerializer):

    id = serializers.CharField()
    sprint_id = serializers.CharField(source="id")
    project_id = serializers.CharField(source="business_id") #sic
    first_entry = ClockEntrySerializer()
    last_entry = ClockEntrySerializer()
    num_issues = serializers.IntegerField()
    hours_per_day = serializers.ListField(child=serializers.DictField())
    issues_created_by_day = serializers.ListField(child=serializers.DictField())
    feature_ids = serializers.ListField(child=serializers.CharField())

    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        super(SprintRoadmapSerializer, self).__init__(*args, **kwargs)
    
    def to_representation(self, sprint_roadmap, *args, **kwargs):
        sprint_roadmap.first_entry = Entry.objects.filter(issue__project_id=sprint_roadmap.id).order_by('start_time').first()
        sprint_roadmap.last_entry = Entry.objects.filter(issue__project_id=sprint_roadmap.id).order_by('-end_time').first()

        issues = sprint_roadmap.issues.all()
        implements_testables = itertools.chain.from_iterable([issue.implements_testables.all() for issue in issues])
        features = itertools.chain.from_iterable([t.features.all() for t in implements_testables])
        sprint_roadmap.feature_ids = [f.id for f in features]
        
        self._populate_activity(sprint_roadmap)

        return super(SprintRoadmapSerializer, self).to_representation(sprint_roadmap, *args, **kwargs)

    def _populate_activity(self, sprint_roadmap):
        DEFAULT_ACTIVITY_BACK_DAYS = 30

        issue_creation_times = Issue.objects.filter(project=sprint_roadmap)\
                                            .aggregate(first_created=Min("created"),
                                                       last_created=Max("created"))

        default_to_date = timezone.now()
        default_from_date = default_to_date - relativedelta(days=DEFAULT_ACTIVITY_BACK_DAYS)
        
        to_date = max(issue_creation_times['last_created'] or default_to_date,
                      sprint_roadmap.last_entry.end_time if sprint_roadmap.last_entry else default_to_date)
        from_date = min(issue_creation_times['first_created'] or default_from_date,
                        sprint_roadmap.first_entry.start_time if sprint_roadmap.first_entry else default_from_date)
            
        self._populate_daily_activity(sprint_roadmap, from_date, to_date)
        self._populate_daily_issues_created(sprint_roadmap, from_date, to_date)
    
    def _populate_daily_activity(self, sprint_roadmap, from_date, to_date):
        all_entries = Entry.objects.filter(issue__project=sprint_roadmap, start_time__gte=from_date)
        sprint_roadmap.hours_per_day = chart_helper.fill_empty_days(from_date, to_date, all_entries.by_day())

    def _populate_daily_issues_created(self, sprint_roadmap, from_date, to_date):
        issues = Issue.objects.filter(project=sprint_roadmap)
        count_by_day = issues.extra(select={'created_day':"date(created)"})\
                             .values('created_day')\
                             .order_by('created_day')\
                             .annotate(count=Count('id'))
        sprint_roadmap.issues_created_by_day = chart_helper.fill_empty_days(from_date, to_date, count_by_day,
                                                                            x_label="created_day", y_label="count")
