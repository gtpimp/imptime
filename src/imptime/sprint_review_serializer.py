from .base_serializer import BaseSerializer, BaseModelSerializer
from rest_framework import serializers
from timepiece.models import ProjectReview as SprintReview
import logging
logger = logging.getLogger(__name__)


class SprintReviewSerializer(BaseModelSerializer):
    id = serializers.CharField()
    review_by_id = serializers.CharField()
    sprint_id = serializers.CharField(source='project_id')
    
    class Meta:
        model = SprintReview
        fields = ('id', 'review_by_id', 'review_cycle_days', 'sprint_id', 'must_always_review', 'modified')

class SprintReviewInboundSerializer(BaseModelSerializer):
    
    class Meta:
        model = SprintReview
        fields = ('review_by', 'review_cycle_days', 'project', 'must_always_review')
        
    def create(self, validated_data):
        return SprintReview.objects.create(review_by=validated_data['review_by'],
                                           review_cycle_days=validated_data['review_cycle_days'],
                                           must_always_review=validated_data['must_always_review'],
                                           project=validated_data['project'])
