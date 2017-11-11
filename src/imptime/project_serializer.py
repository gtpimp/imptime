import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from timepiece.models import Feature, IssueStatus
from timepiece.models import ProjectStatus as SprintStatus
from timepiece.models import ProjectDeadlineType as SprintDeadlineType
from timepiece.models import BusinessPermissions as ProjectPermissions
from timepiece.models import BusinessInvite as ProjectInvite
from project_user_permission_serializer import ProjectUserPermissionSerializer
logger = logging.getLogger(__name__)

class ProjectSerializer(BaseSerializer):

    id = serializers.CharField()
    name = serializers.CharField()
    allowed_user_ids = serializers.ListField(child=serializers.CharField())
    invited_user_ids = serializers.ListField(child=serializers.CharField())
    allowed_issue_status_names = serializers.ListField(child=serializers.CharField())
    allowed_sprint_status_names = serializers.ListField(child=serializers.CharField())
    allowed_deadline_types = serializers.ListField(child=serializers.CharField())
    feature_names = serializers.ListField(child=serializers.CharField())
    logged_in_users_permissions = ProjectUserPermissionSerializer(source='user_permissions')

    def __init__(self, *args, **kwargs):
        logged_in_user = kwargs.pop('logged_in_user')
        super(ProjectSerializer, self).__init__(*args, **kwargs)
        self.logged_in_user = logged_in_user

    def to_representation(self, project, *args, **kwargs):
        # Note: confusing business/project naming confusion in almost
        # every line of this function, we mark every line with sic to
        # put us off propagating the confusion out of this function.

        project_user_ids = project.allowed_user_ids #sic
        project.invited_user_ids = project_user_ids.filter(invites_received__accepted=False)
        project.feature_names = Feature.objects.filter(business=project).order_by("name")  # sic

        project.allowed_issue_status_names =  [x for x in IssueStatus.objects.all()\
                                               .filter(business=project)\
                                               .order_by("name")\
                                               .values_list('name', flat=True)] #sic

        project.allowed_sprint_status_names = [x for x in SprintStatus.objects.all()\
                                               .filter(business=project)\
                                               .order_by("name")\
                                               .values_list('name', flat=True)] #sic

        project.allowed_deadline_types = [x for x in SprintDeadlineType.objects.all()\
                                          .filter(business=project)\
                                          .order_by("name")\
                                          .values_list("name", flat=True)] #sic
        
        project.user_permissions = ProjectPermissions.for_user(user=self.logged_in_user,
                                                               business=project) #sic

        return super(ProjectSerializer, self).to_representation(
            project, *args, **kwargs)

    
