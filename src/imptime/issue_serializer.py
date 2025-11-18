import logging
from rest_framework import serializers
from django.utils import timezone
from drf_compound_fields.fields import ListField
from .base_serializer import BaseSerializer
from .issue_estimate_serializer import IssueEstimateSerializer, IssueHoursSerializer
from .issue_comment_serializer import IssueCommentSerializer, IssueShareCommentSerializer
from imptime.models import AnnotatedVisualSpecDocument
from timepiece.models import BusinessPermissions, Issue
from .testable_serializer import TestableSerializer
from testable.models import Testable
from django.conf import settings
logger = logging.getLogger(__name__)

class IssueSerializer(BaseSerializer):

    id = serializers.CharField()
    assigned_to_quick_name = serializers.CharField()
    subject = serializers.CharField()
    subject_quality_error = serializers.CharField()
    description = serializers.CharField()
    enriched_description = serializers.CharField()
    status_name = serializers.CharField(source='status2_name')
    type_name = serializers.CharField()
    assigned_to_id = serializers.CharField()
    number = serializers.IntegerField()
    sprint_id = serializers.CharField()
    project_id = serializers.CharField()
    tag_ids = serializers.ListField(child=serializers.CharField())
    tag_category_ids = serializers.ListField(child=serializers.CharField())
    all_actuals = IssueHoursSerializer(many=True)
    all_estimates = IssueEstimateSerializer(many=True)
    my_estimate = IssueEstimateSerializer(many=True)
    actual_hours = serializers.FloatField()
    my_actual_hours = serializers.FloatField()
    am_i_clocked_in = serializers.BooleanField()
    currently_clocked_in_by_user_ids = serializers.ListField(serializers.CharField())
    can_group_issues = serializers.BooleanField()
    parent_group_id = serializers.CharField(source="parent_group.id")
    group_children = ListField(source="group_children_ids")
    comments = IssueCommentSerializer(many=True)
    testables = TestableSerializer(many=True, source="testables_in_order")
    feature_testables = TestableSerializer(many=True)
    needs_testables = serializers.BooleanField()
    needs_estimate = serializers.BooleanField()
    needs_issue_ids = serializers.ListField(child=serializers.CharField())
    issue_ids_needing_us = serializers.ListField(child=serializers.CharField())
    needs_open_issues_ids = serializers.ListField(child=serializers.CharField())
    annotated_visual_spec_document_ids = ListField()
    created_at = serializers.DateTimeField(source='created')
    created_by_id = serializers.CharField()
    modified_at = serializers.DateTimeField(source='modified')
    review_ids = serializers.ListField(child=serializers.CharField())
    share_ref = serializers.CharField()
    has_attachment = serializers.SerializerMethodField()
    risky = serializers.BooleanField()
    due_date = serializers.DateTimeField()
    estimate_too_large = serializers.BooleanField()

    def get_has_attachment(self, issue):
        if len(issue.annotated_visual_spec_document_ids) > 0:
            return True
        return False

    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        return super(IssueSerializer, self).__init__(*args, **kwargs)
    
    def to_representation(self, issue, *args, **kwargs):
        issue.assigned_to_quick_name = \
            issue.assigned_to.username if issue.assigned_to_id else None

        bp = BusinessPermissions.for_user(user=self.logged_in_user, business=issue.project.business, auto_create=False)
        
        issue.status2_name = issue.status2.name if issue.status2_id else None
        issue.type_name = issue.issue_type
        issue.sprint_id = str(issue.project_id)  # sic
        issue.project_id = str(issue.project.business_id)  # sic
        issue.group_children_ids = issue.group_children.all().values_list('id', flat=True)
        issue.my_actual_hours = sum([float(x.hours or ((timezone.now()-x.start_time).seconds/3600.0)) for x in issue.my_entries])
        issue.am_i_clocked_in = len(issue.my_clocked_in_entries) > 0
        issue.needs_testables = issue.issue_type in issue.TESTABLE_ISSUE_TYPES
        issue.currently_clocked_in_by_user_ids = [x.id for x in issue.currently_clocked_in_by()]
        issue.annotated_visual_spec_document_ids = AnnotatedVisualSpecDocument.objects.filter(visual_spec_issues__issue=issue)\
                                                                                      .order_by("visual_spec_issues__order")\
                                                                                      .values_list('id', flat=True)
        issue.review_ids = [x.id for x in issue.reviews.all()]
        issue.tag_category_ids = [x.category_id for x in issue.tags.all()]
        issue.tag_ids = [x.id for x in issue.tags.all()]

        if not bp.has_see_other_user_points:
            issue.all_estimates = [x for x in (issue.all_estimates or []) if x.user_id == self.logged_in_user.id]
        
        all_actuals = {}
        for entry in issue.all_entries:
            if bp.has_see_other_user_points or entry.user_id == self.logged_in_user.id:
                all_actuals.setdefault(entry.user_id, {'user_id':entry.user_id}).setdefault('hours', 0)
                all_actuals[entry.user_id]['hours'] += entry.hours

        issue.all_actuals = all_actuals.values()

        issue_has_estimate_by_assigned_user = len([x for x in (issue.all_estimates or []) if x.user_id==issue.assigned_to_id and x.points > 0])
        issue.estimate_too_large = len([x for x in (issue.all_estimates or []) if x.user_id == issue.assigned_to_id and x.points > settings.MAX_ISSUE_ESTIMATE])

        if bp.can_see_other_user_points:
            issue.needs_estimate = not issue_has_estimate_by_assigned_user
        
        elif bp.has_estimate_own_points:
            if issue.assigned_to_id != self.logged_in_user.id:
                issue.needs_estimate = False
            else:
                issue.needs_estimate = not issue_has_estimate_by_assigned_user
        else:
            issue.needs_estimate = False
            
        if not bp.has_share_issues:
            issue.share_ref = None

        issue.needs_issue_ids = [ x.id for x in issue.needs_issues.all() ]
        issue.issue_ids_needing_us = [ x.id for x in issue.issues_needing_us.all() ]
        issue.needs_open_issues_ids = [ x.id for x in issue.needs_issues.all() if x.status2.name in Issue.STATUSES_INDICATING_INCOMPLETE['developer'] ]

        # Hack: very odd, the feature_testables has no id after being serialized unless I do this. Could't figure it out.
        issue.feature_testables = Testable.objects.filter(pk__in=[x.id for x in issue.implements_testables.all() ])
        
        return super(IssueSerializer, self).to_representation(issue, *args, **kwargs)

class IssueGeneralDetailsSerializer(BaseSerializer):

    id = serializers.CharField()
    description = serializers.CharField()
    comments = IssueCommentSerializer(many=True)

    def to_representation(self, issue, *args, **kwargs):
        issue.comments = issue.comments.all().order_by("-created")
        return super(IssueGeneralDetailsSerializer, self)\
            .to_representation(issue, *args, **kwargs)

class IssueEstimate(BaseSerializer):
    pass

class IssueWithEstimatesSerializer(IssueSerializer):
    issue_estimates = IssueEstimate(many=True)

class IssueShareSerializer(BaseSerializer):
    id = serializers.CharField()
    subject = serializers.CharField()
    description = serializers.CharField()
    enriched_description = serializers.CharField()
    status_name = serializers.CharField(source='status2.name')
    type_name = serializers.CharField(source="issue_type")
    number = serializers.IntegerField()
    sprint_id = serializers.CharField(source="project_id")
    project_id = serializers.CharField(source="project.business_id")
    tag_ids = serializers.ListField(child=serializers.CharField())
    tag_category_ids = serializers.ListField(child=serializers.CharField())
    can_group_issues = serializers.BooleanField()
    group_children = ListField(source="group_children_ids")
    comments = IssueShareCommentSerializer(many=True, source='allowed_comments')
    created_at = serializers.DateTimeField(source='created')
    modified_at = serializers.DateTimeField(source='modified')
    share_ref = serializers.CharField()
    share_ref_expiry = serializers.DateTimeField()
    
    def to_representation(self, issue, *args, **kwargs):
        issue.tag_category_ids = [x.category_id for x in issue.tags.all()]
        issue.tag_ids = [x.id for x in issue.tags.all()]
        issue.group_children_ids = issue.group_children.all().values_list('id', flat=True)
        return super(IssueShareSerializer, self).to_representation(issue, *args, **kwargs)
