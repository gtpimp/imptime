import logging
from rest_framework import serializers
from .base_serializer import BaseModelSerializer
from imptime.models import CompanyProblem
logger = logging.getLogger(__name__)

class CompanyProblemSerializer(BaseModelSerializer):
    
    id = serializers.CharField()
    user_id = serializers.CharField()
    sprint_id = serializers.CharField()
    project_id = serializers.CharField(source="sprint.business_id") #sic
    modified = serializers.DateTimeField()
    created = serializers.DateTimeField()

    class Meta:
        model = CompanyProblem 
        fields = ('id', 'user_id', 'sprint_id', 'problem_type', 'status',
                  'description', 'project_id', 'modified', 'created')
