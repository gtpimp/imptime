import logging
from rest_framework import serializers
from drf_compound_fields.fields import ListField
from base_serializer import BaseSerializer, BaseModelSerializer
from tag_serializer import TagSerializer
from user_serializer import UserSerializer
from timepiece.models import Issue
logger = logging.getLogger(__name__)


class IssueSerializer(BaseSerializer):

    id = serializers.CharField()
    assigned_to_quick_name = serializers.CharField()
    feature = serializers.CharField()
    subject = serializers.CharField()
    status = serializers.CharField()
    assigned_to_id = serializers.CharField()
    feature_name = serializers.CharField()
    number = serializers.IntegerField()
    position_if_creating_new_issue_after = serializers.IntegerField()
    sprint_id = serializers.CharField()
    project_id = serializers.CharField()
    tags = TagSerializer(many=True)
    dev_estimate_hours = serializers.FloatField()
    dev_estimate_user_quick_name = serializers.CharField()
    actual_hours = serializers.FloatField()
    currently_clocked_in_by = UserSerializer(many=True)
    can_group_issues = serializers.BooleanField()
    parent_group_id = serializers.CharField()
    group_children = ListField(source="group_children_ids")
 
    def to_representation(self, issue, *args, **kwargs):
        issue.assigned_to_quick_name = \
            issue.assigned_to.username if issue.assigned_to_id else None

        issue.feature_name = issue.feature.name if issue.feature_id else None
        issue.position_if_creating_new_issue_after = issue.order + 0.5
        issue.sprint_id = str(issue.project.id)  # sic
        issue.project_id = str(issue.project.business_id)  # sic

        issue.dev_estimate_hours = 0
        issue.dev_estimate_user_quick_name = None
        for point in issue.issue_points.all():
            if point.user_id == issue.assigned_to_id:
                issue.dev_estimate_hours = point.points
                issue.dev_estimate_user_quick_name = point.user.username
                break
        
        issue.group_children_ids = [x.id for x in issue.group_children.all()]
        issue.currently_clocked_in_by = [x.user for x in issue.active_clocks]

        d = super(IssueSerializer, self).to_representation(
            issue, *args, **kwargs)
        return d


class IssueCommentSerializer(BaseSerializer):
    id = serializers.CharField()
    comment = serializers.CharField()
    author_id = serializers.CharField()
    created = serializers.DateTimeField()
    modified = serializers.DateTimeField()


class IssueGeneralDetailsSerializer(BaseSerializer):

    id = serializers.CharField()
    description = serializers.CharField()
    issue_comments = IssueCommentSerializer(many=True)

    def to_representation(self, issue, *args, **kwargs):
        issue.issue_comments = issue.comments.all().order_by("-created")
        return super(IssueGeneralDetailsSerializer, self)\
            .to_representation(issue, *args, **kwargs)

class IssueEstimate(BaseSerializer):
    pass
    
class IssueWithEstimatesSerializer(IssueSerializer):

    issue_estimates = IssueEstimate(many=True)
