import logging
from rest_framework import serializers
from django.conf import settings
from base_serializer import BaseSerializer
from clock_entry_serializer import ClockEntrySerializer
from timepiece.models import Entry
from imptime.models import SprintTemplate
from timepiece.models import ProjectDeadline as SprintDeadline
from timepiece.models import ProjectReview as SprintReview
from timepiece.models import BusinessPermissions as ProjectPermissions
logger = logging.getLogger(__name__)

class SprintSerializer(BaseSerializer):

    id = serializers.CharField()
    number = serializers.CharField()
    name = serializers.CharField()
    status_name = serializers.CharField()
    is_open = serializers.BooleanField()
    project_id = serializers.CharField(source="business_id") #sic
    description = serializers.CharField()
    first_entry = ClockEntrySerializer()
    last_entry = ClockEntrySerializer()
    created = serializers.DateTimeField()
    num_issues = serializers.IntegerField()
    num_issues_with_estimates = serializers.IntegerField()
    num_open_issues_with_estimates = serializers.IntegerField()
    estimated_hours_by_assignee = serializers.FloatField()
    estimated_open_hours_by_assignee = serializers.FloatField()
    sprint_type = serializers.CharField(source="project_type")
    sprint_template_id = serializers.CharField(source="cloned_from_sprint_id")
    sprint_clone_ids = serializers.ListField(child=serializers.CharField())
    deadline_ids = serializers.ListField(child=serializers.CharField(), source="ordered_deadline_ids")
    review_ids = serializers.ListField(child=serializers.CharField())
    user_ids_who_can_estimate = serializers.ListField(child=serializers.CharField())
    ratio_management = serializers.FloatField()
    ratio_testing = serializers.FloatField()
    ratio_scope_creep = serializers.FloatField()
    commission_percentage = serializers.FloatField()
    budget = serializers.FloatField()
    hours_by_assignee = serializers.FloatField()

    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        self.estimates_by_sprint_id = kwargs.pop('estimates_by_sprint_id')
        self.hours_per_sprint_by_assignee = kwargs.pop('hours_per_sprint_by_assignee')
        return super(SprintSerializer, self).__init__(*args, **kwargs)
    
    def to_representation(self, sprint, *args, **kwargs):
        bp = ProjectPermissions.for_user(user=self.logged_in_user, business=sprint.business, auto_create=False)  #sic
        sprint.status_name = sprint.status3 and sprint.status3.name
        sprint.first_entry = Entry.objects.filter(issue__project_id=sprint.id).order_by('start_time').first()
        sprint.last_entry = Entry.objects.filter(issue__project_id=sprint.id).order_by('-end_time').first()

        sprint.num_issues_with_estimates = self.estimates_by_sprint_id.get(sprint.id, {}).get('num_estimated', 0)
        sprint.estimated_hours_by_assignee = self.estimates_by_sprint_id.get(sprint.id, {}).get('estimated_hours', 0)
        sprint.num_open_issues_with_estimates = self.estimates_by_sprint_id.get(sprint.id, {}).get('num_open_estimated', 0)
        sprint.estimated_open_hours_by_assignee = self.estimates_by_sprint_id.get(sprint.id, {}).get('estimated_open_hours', 0)

        sprint_template = sprint.parent_sprint_templates.all().first()
        if sprint_template:
            sprint.cloned_from_sprint_id = sprint_template.sprint_id
        else:
            sprint.cloned_from_sprint_id = None

        sprint.sprint_clone_ids = SprintTemplate.objects.filter(sprint=sprint).values_list('clones__id', flat=True)
        sprint.ordered_deadline_ids = sprint.deadlines.order_by("deadline").values_list('id', flat=True)
        sprint.review_ids = [x.id for x in sprint.reviews.all()]
        
        users_who_can_estimate = bp.get_users_who_can_estimate_time(business_id=sprint.business_id) #sic
        if not bp.has_see_other_user_points:
            users_who_can_estimate = users_who_can_estimate.filter(pk=self.logged_in_user.id)
        sprint.user_ids_who_can_estimate = users_who_can_estimate.values_list('id', flat=True)

        if not bp.has_edit_ctc_billable_rates:
            sprint.commission_percentage = None
        if not bp.has_view_velocity:
            sprint.ratio_management = None
            sprint.ratio_testing = None
            sprint.ratio_scope_creep = None
        if not bp.has_view_budget:
            sprint.budget = None

        sprint.hours_by_assignee = self.hours_per_sprint_by_assignee.get(sprint.id, 0)
            
        return super(SprintSerializer, self).to_representation(sprint, *args, **kwargs)
