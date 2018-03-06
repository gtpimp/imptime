import logging
from rest_framework import serializers
from django.utils import timezone
from drf_compound_fields.fields import ListField
from django.db.models import Sum
from base_serializer import BaseSerializer, BaseModelSerializer
from tag_serializer import TagSerializer
from issue_estimate_serializer import IssueEstimateSerializer, IssueHoursSerializer
from issue_comment_serializer import IssueCommentSerializer
from issue_attachment_serializer import IssueAttachmentSerializer
from visual_spec_issue_annotation_serializer import VisualSpecIssueAnnotationSerializer
from imptime.models import VisualSpecDocument, VisualSpecIssueAnnotation
from timepiece.models import BusinessPermissions, IssueReview
from testable_serializer import TestableSerializer
logger = logging.getLogger(__name__)

class IssueSerializer(BaseSerializer):

    id = serializers.CharField()
    assigned_to_quick_name = serializers.CharField()
    feature = serializers.CharField()
    subject = serializers.CharField()
    subject_quality_error = serializers.CharField()
    description = serializers.CharField()
    status_name = serializers.CharField(source='status2_name')
    type_name = serializers.CharField()
    assigned_to_id = serializers.CharField()
    feature_name = serializers.CharField()
    number = serializers.IntegerField()
    sprint_id = serializers.CharField()
    project_id = serializers.CharField()
    tag_ids = serializers.ListField(child=serializers.CharField())
    tag_category_ids = serializers.ListField(child=serializers.CharField())
    dev_estimate_hours = serializers.FloatField()
    dev_estimate_user_quick_name = serializers.CharField()
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
    attachments = IssueAttachmentSerializer(many=True)
    visual_spec_document_ids = ListField()
    visual_spec_annotation_ids_by_doc_id = serializers.DictField(child=ListField(child=serializers.IntegerField()))
    created_at = serializers.DateTimeField(source='created')
    created_by_id = serializers.CharField()
    modified_at = serializers.DateTimeField(source='modified')
    review_ids = serializers.ListField(child=serializers.CharField())

    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        return super(IssueSerializer, self).__init__(*args, **kwargs)
    
    def to_representation(self, issue, *args, **kwargs):
        issue.assigned_to_quick_name = \
            issue.assigned_to.username if issue.assigned_to_id else None

        bp = BusinessPermissions.for_user(user=self.logged_in_user, business=issue.project.business, auto_create=False) 
        
        issue.feature_name = issue.feature.name if issue.feature_id else None
        issue.status2_name = issue.status2.name if issue.status2_id else None
        issue.type_name = "adhoc" if issue.adhoc else "issue"
        issue.sprint_id = str(issue.project_id)  # sic
        issue.project_id = str(issue.project.business_id)  # sic
        issue.dev_estimate_hours, issue.dev_estimate_user_quick_name = issue.best_hours_estimate
        issue.group_children_ids = issue.group_children.all().values_list('id', flat=True)
        issue.my_actual_hours = sum([float(x.hours or ((timezone.now()-x.start_time).seconds/3600.0)) for x in issue.my_entries])
        issue.am_i_clocked_in = len(issue.my_clocked_in_entries) > 0
        issue.currently_clocked_in_by_user_ids = [x.id for x in issue.currently_clocked_in_by()]
        issue.visual_spec_document_ids = VisualSpecDocument.objects.filter(visual_spec_issues__issue=issue)\
                                                                   .order_by("visual_spec_issues__order")\
                                                                   .values_list('id', flat=True)
        issue.visual_spec_annotation_ids_by_doc_id = {}
        for x in VisualSpecIssueAnnotation.objects.filter(visual_spec_issue__issue=issue).values('visual_spec_issue__visual_spec_document_id', 'id'):
            issue.visual_spec_annotation_ids_by_doc_id.setdefault(x['visual_spec_issue__visual_spec_document_id'], []).append(x['id'])
                                                                              
        issue.review_ids = [x.id for x in issue.reviews.all()]
        issue.tag_category_ids = [x.category_id for x in issue.tags.all()]
        issue.tag_ids = [x.id for x in issue.tags.all()]

        if not bp.has_see_other_user_points:
            issue.all_estimates = None
            issue.all_actuals = None
        else:
            all_actuals = {}
            for entry in issue.all_entries:
                all_actuals.setdefault(entry.user_id, {'user_id':entry.user_id}).setdefault('hours', 0)
                all_actuals[entry.user_id]['hours'] += entry.hours
            issue.all_actuals = all_actuals.values()
            

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
