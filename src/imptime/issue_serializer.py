import logging
from rest_framework import serializers
from django.utils import timezone
from drf_compound_fields.fields import ListField
from base_serializer import BaseSerializer
from tag_serializer import TagSerializer
from issue_estimate_serializer import IssueEstimateSerializer
from issue_comment_serializer import IssueCommentSerializer
from issue_attachment_serializer import IssueAttachmentSerializer
from visual_spec_document_serializer import VisualSpecDocumentDownloadSerializer
from testable_serializer import TestableSerializer
logger = logging.getLogger(__name__)


class IssueSerializer(BaseSerializer):

    id = serializers.CharField()
    assigned_to_quick_name = serializers.CharField()
    feature = serializers.CharField()
    subject = serializers.CharField()
    description = serializers.CharField()
    status_name = serializers.CharField(source='status2_name')
    assigned_to_id = serializers.CharField()
    feature_name = serializers.CharField()
    number = serializers.IntegerField()
    position_if_creating_new_issue_after = serializers.IntegerField()
    sprint_id = serializers.CharField()
    project_id = serializers.CharField()
    tags = TagSerializer(many=True)
    dev_estimate_hours = serializers.FloatField()
    dev_estimate_user_quick_name = serializers.CharField()
    all_estimates = IssueEstimateSerializer(many=True)
    actual_hours = serializers.FloatField()
    my_actual_hours = serializers.FloatField()
    am_i_clocked_in = serializers.BooleanField()
    currently_clocked_in_by_user_ids = serializers.ListField(serializers.CharField())
    can_group_issues = serializers.BooleanField()
    parent_group_id = serializers.CharField(source="parent_group.id")
    group_children = ListField(source="group_children_ids")
    comments = IssueCommentSerializer(many=True)
    testables = TestableSerializer(many=True)
    attachments = IssueAttachmentSerializer(many=True)
    visual_spec_documents = VisualSpecDocumentDownloadSerializer(many=True, source="enriched_visual_spec_documents")
    created_at = serializers.DateTimeField(source='created')
    modified_at = serializers.DateTimeField(source='modified')

    def to_representation(self, issue, *args, **kwargs):
        issue.assigned_to_quick_name = \
            issue.assigned_to.username if issue.assigned_to_id else None

        issue.feature_name = issue.feature.name if issue.feature_id else None
        issue.status2_name = issue.status2.name if issue.status2_id else None
        issue.position_if_creating_new_issue_after = (issue.order or 0) + 0.5
        issue.sprint_id = str(issue.project_id)  # sic
        issue.project_id = str(issue.project.business_id)  # sic
        issue.dev_estimate_hours, issue.dev_estimate_user_quick_name = issue.best_hours_estimate
        issue.group_children_ids = issue.group_children.all().values_list('id', flat=True)
        issue.my_actual_hours = sum([float(x.hours or ((timezone.now()-x.start_time).seconds/3600.0)) for x in issue.my_entries])
        issue.am_i_clocked_in = len(issue.my_clocked_in_entries) > 0
        issue.currently_clocked_in_by_user_ids = [x.id for x in issue.currently_clocked_in_by()]
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
