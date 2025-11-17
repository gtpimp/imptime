from .base_serializer import BaseSerializer
import logging
from rest_framework import serializers
logger = logging.getLogger(__name__)

class BaseResultSerializer(BaseSerializer):
    result_category = serializers.CharField()

    def __init__(self, *args, **kwargs):
        result_category = kwargs.pop('result_category')
        self.result_category = result_category
        super(BaseResultSerializer, self).__init__(*args, **kwargs)
    
    def to_representation(self, obj, *args, **kwargs):
        obj.result_category =  self.result_category
        return super(BaseResultSerializer, self).to_representation(obj, *args, **kwargs)

    
class ProjectResultSerializer(BaseResultSerializer):
    project_id = serializers.CharField(source='id')
    name = serializers.CharField()
    

class SprintResultSerializer(BaseResultSerializer):
    sprint_id = serializers.CharField(source='id')
    number = serializers.CharField()
    name = serializers.CharField()
    status_name = serializers.CharField()
    project_id = serializers.CharField(source="business_id") #sic
    project_name = serializers.CharField()
    
    def to_representation(self, sprint, *args, **kwargs):
        sprint.status_name = sprint.status3 and sprint.status3.name
        sprint.project_name = sprint.business.name #sic
        return super(SprintResultSerializer, self).to_representation(sprint, *args, **kwargs)

    
class IssueResultSerializer(BaseResultSerializer):
    issue_id = serializers.CharField(source='id')
    number = serializers.CharField()
    subject = serializers.CharField()
    status_name = serializers.CharField(source='status2_name')
    assigned_to_quick_name = serializers.CharField()
    sprint_id = serializers.CharField()
    sprint_name = serializers.CharField()
    project_id = serializers.CharField()
    project_name = serializers.CharField()
    

    def to_representation(self, issue, *args, **kwargs):
        issue.assigned_to_quick_name = \
            issue.assigned_to.username if issue.assigned_to_id else None

        issue.status2_name = issue.status2.name if issue.status2_id else None
        issue.sprint_id = str(issue.project_id)  # sic
        issue.sprint_name = issue.project.name
        issue.project_id = str(issue.project.business_id)  # sic
        issue.project_name = issue.project.business.name
        return super(IssueResultSerializer, self).to_representation(issue, *args, **kwargs)

    
