import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from timepiece.models import BusinessPermissions, Feature, IssueStatus
from timepiece.models import ProjectStatus as SprintStatus
from permission_serializer import PermissionSerializer
logger = logging.getLogger(__name__)


class ProjectSerializer(BaseSerializer):

    id = serializers.CharField()
    name = serializers.CharField()
    allowed_user_ids = serializers.ListField(child=serializers.CharField())
    allowed_issue_status_names = serializers.ListField(child=serializers.CharField())
    allowed_sprint_status_names = serializers.ListField(child=serializers.CharField())
    feature_names = serializers.ListField(child=serializers.CharField())
    permissions = PermissionSerializer(source='user_permissions')
    
    def __init__(self, *args, **kwargs):
        logged_in_user = kwargs.pop('logged_in_user')
        super(ProjectSerializer, self).__init__(*args, **kwargs)
        self.logged_in_user = logged_in_user

    def to_representation(self, project, *args, **kwargs):
        # Note: confusing business/project naming confusion in almost
        # every line of this function, we mark every line with sic to
        # put us off propagating the confusion out of this function.
        project.allowed_user_ids = BusinessPermissions.viewable_users_for_business(
            logged_in_user=self.logged_in_user, business_id=project.id).values_list('id', flat=True).order_by("username") #sic
        project.feature_names = \
            Feature.objects.filter(business=project).order_by("name")  # sic
        project.allowed_issue_status_names = \
            [x for x in IssueStatus.objects.all().filter(business=project).order_by("name").values_list('name', flat=True)] #sic
        project.allowed_sprint_status_names = \
            [x for x in SprintStatus.objects.all().filter(business=project).order_by("name").values_list('name', flat=True)] #sic
        project.user_permissions = BusinessPermissions.for_user(user=self.logged_in_user, business=project) #sic
        
        return super(ProjectSerializer, self).to_representation(
            project, *args, **kwargs)
