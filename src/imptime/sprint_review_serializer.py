from base_serializer import BaseSerializer, BaseModelSerializer
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
        fields = ('id', 'review_by_id', 'review_cycle_days', 'sprint_id', 'modified')

class SprintReviewInboundSerializer(BaseModelSerializer):
    review_by_id = serializers.CharField()
    
    class Meta:
        model = SprintReview
        fields = ('review_by_id', 'review_cycle_days', 'project') 
        
