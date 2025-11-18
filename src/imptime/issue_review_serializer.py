from .base_serializer import BaseSerializer, BaseModelSerializer
from rest_framework import serializers
from timepiece.models import IssueReview
import logging
logger = logging.getLogger(__name__)

class IssueReviewDueDateSerializer(BaseSerializer):
    user_id = serializers.CharField()
    review_at = serializers.DateTimeField()

class IssueReviewSerializer(BaseModelSerializer):
    reviewed_by_id = serializers.CharField()
    issue_id = serializers.CharField()
    sprint_id = serializers.CharField(source='issue.project_id')
    review_due_at_by_reviewer = serializers.DateTimeField()
    review_due_dates = serializers.ListField(IssueReviewDueDateSerializer())
    
    class Meta:
        model = IssueReview
        fields = ('id', 'last_reviewed_at', 'reviewed_by_id',
                  'review_due_dates', 'issue_id', 'sprint_id',
                  'review_due_at_by_reviewer')

    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        super(IssueReviewSerializer, self).__init__(*args, **kwargs)
        
    def to_representation(self, issue_review, *args, **kwargs):
        issue_review.review_due_at_by_reviewer = IssueReview.get_next_due_date_for_review(issue_review.issue, issue_review.reviewed_by)
        issue_review.review_due_dates = issue_review.get_review_due_dates()
        return super(IssueReviewSerializer, self).to_representation(issue_review, *args, **kwargs)
 
