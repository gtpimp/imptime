from base_serializer import BaseSerializer, BaseModelSerializer
from rest_framework import serializers
from timepiece.models import IssueReview
import logging
logger = logging.getLogger(__name__)


class IssueReviewSerializer(BaseModelSerializer):
    reviewed_by_id = serializers.CharField()
    issue_id = serializers.CharField()
    sprint_id = serializers.CharField(source='issue.sprint_id')
    review_due_at_by_any_user = serializers.DateField()
    
    class Meta:
        model = IssueReview
        fields = ('id', 'last_reviewed_at', 'reviewed_by_id',
                  'review_due_at', 'issue_id', 'sprint_id',
                  'review_due_at_by_any_user')

    def to_representation(self, issue_review, *args, **kwargs):
        issue_review.review_due_at_by_any_user = IssueReview.get_last_due_date_for_review(issue_review.issue)
        return super(IssueReviewSerializer, self).to_representation(issue_review, *args, **kwargs)
