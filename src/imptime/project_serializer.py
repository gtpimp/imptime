import logging
from rest_framework import serializers
from .base_serializer import BaseSerializer, BaseModelSerializer
from timepiece.models import IssueStatus, Issue, ProjectRole, Rate
from timepiece.models import Project as Sprint
from timepiece.models import ProjectStatus as SprintStatus
from timepiece.models import ProjectDeadlineType as SprintDeadlineType
from timepiece.models import BusinessPermissions as ProjectPermissions
from imptime.models import VisualSpecDocument
from .project_user_permission_serializer import ProjectUserPermissionSerializer
from imptime.project_dashboard_api import get_recent_activity
logger = logging.getLogger(__name__)

class ProjectDeadlineTypeSerializer(BaseModelSerializer):

    value = serializers.CharField(source="id")
    label = serializers.CharField(source="name")
    
    class Meta:
        model = SprintDeadlineType
        fields = ( 'id', 'name', "value", "label" )

class ProjectRecentActivity(BaseSerializer):
    most_recent_clock_entry = serializers.DictField()
    most_recent_issue = serializers.DictField()
    project_created_at = serializers.DateTimeField()
    sprint_last_modified_at = serializers.DateTimeField()
    is_inactive = serializers.BooleanField()
    is_expired = serializers.BooleanField()
    is_active = serializers.BooleanField()
    is_closed = serializers.BooleanField()
    sort_date = serializers.DateTimeField()
    sort_reason = serializers.CharField()

class ProjectSerializer(BaseSerializer):

    id = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
    allowed_user_ids = serializers.ListField(child=serializers.CharField())
    invited_user_ids = serializers.ListField(child=serializers.CharField())
    allowed_issue_status_names = serializers.ListField(child=serializers.CharField())
    open_issue_status_names = serializers.ListField(child=serializers.CharField())
    closed_issue_status_names = serializers.ListField(child=serializers.CharField())
    allowed_issue_type_names = serializers.ListField(child=serializers.CharField())
    allowed_sprint_status_names = serializers.ListField(child=serializers.CharField())
    allowed_sprint_type_names = serializers.ListField(child=serializers.CharField())
    allowed_deadline_types = serializers.ListField(child=ProjectDeadlineTypeSerializer())
    logged_in_users_permissions = ProjectUserPermissionSerializer(source='user_permissions')
    logged_in_users_roles = serializers.ListField(child=serializers.CharField())
    logged_in_users_default_role = serializers.CharField()
    num_open_sprints = serializers.IntegerField()
    visual_spec_document_ids = serializers.ListField()
    can_delete_project = serializers.SerializerMethodField('is_project_deletable')
    recent_activity = ProjectRecentActivity()
    archived = serializers.BooleanField()

    def is_project_deletable(self, project):

        if len(project.sprints) == 0:
            return True
        else:
            issue_count = Issue.objects.filter(project__business=project.id).count() == 0
            return issue_count
        return False
            
    
    def __init__(self, *args, **kwargs):
        logged_in_user = kwargs.pop('logged_in_user')
        super(ProjectSerializer, self).__init__(*args, **kwargs)
        self.logged_in_user = logged_in_user

    def to_representation(self, project, *args, **kwargs):
        # Note: confusing business/project naming confusion in almost
        # every line of this function, we mark every line with sic to
        # put us off propagating the confusion out of this function.

        project_user_ids = project.allowed_user_ids #sic
        project.logged_in_users_roles = ProjectRole.objects.filter(business=project).order_by("name").values_list("name", flat=True) #sic

        best_rate = Rate.for_business(user_id=self.logged_in_user.id, business_id=project.id)
        project.logged_in_users_default_role = best_rate.time_tracking_mode if best_rate else "developer"
        project.invited_user_ids = project_user_ids.filter(invites_received__accepted=False)
        project.allowed_sprint_type_names = [ k for k,v in Sprint.PROJECT_TYPES ] #sic

        project.allowed_issue_status_names =  [x for x in IssueStatus.objects.all()\
                                               .filter(business=project)\
                                               .order_by("name")\
                                               .values_list('name', flat=True)] #sic

        nested_incomplete_status_names_for_role = [v for k,v in Issue.STATUSES_INDICATING_INCOMPLETE.items() if k in project.logged_in_users_default_role]
        incomplete_status_names_for_role = [item for sublist in nested_incomplete_status_names_for_role for item in sublist]
        project.open_issue_status_names = [x for x in project.allowed_issue_status_names if x in incomplete_status_names_for_role]
        project.closed_issue_status_names = [x for x in project.allowed_issue_status_names if x not in incomplete_status_names_for_role]
        
        project.allowed_issue_type_names = [x[0] for x in Issue.ISSUE_TYPES]
        
        project.allowed_sprint_status_names = [x for x in SprintStatus.objects.all()\
                                               .filter(business=project)\
                                               .order_by("name")\
                                               .values_list('name', flat=True)] #sic

        project.allowed_deadline_types = SprintDeadlineType.objects.all()\
                                                                   .filter(business=project)\
                                                                   .order_by("name")
        
        project.user_permissions = ProjectPermissions.for_user(user=self.logged_in_user,
                                                               business=project, auto_create=False) #sic
        project.num_open_sprints = Sprint.objects.filter(business=project).filter_open().count() #sic
        project.visual_spec_document_ids = VisualSpecDocument.objects.filter(visual_spec_projects__project=project)\
                                                                     .order_by("visual_spec_projects__order")\
                                                                     .values_list('id', flat=True)
        project.recent_activity = get_recent_activity(project)

        return super(ProjectSerializer, self).to_representation(
            project, *args, **kwargs)

    
