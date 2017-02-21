import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)

class ProjectUserPermissionSerializer(BaseSerializer):

    id = serializers.CharField()
    project_id = serializers.CharField()
    user_id = serializers.CharField()
    
    is_active_member_of_business = serializers.BooleanField()
    has_invite_users = serializers.BooleanField()
    has_set_user_permissions = serializers.BooleanField()
    has_view_project_card = serializers.BooleanField()
    has_edit_issues = serializers.BooleanField()
    has_view_issues = serializers.BooleanField()
    has_edit_issue_states = serializers.BooleanField()
    has_edit_project_states = serializers.BooleanField()
    has_add_issue = serializers.BooleanField()
    has_delete_issue = serializers.BooleanField()
    has_edit_description = serializers.BooleanField()
    has_add_issue_comment = serializers.BooleanField()
    has_edit_subject = serializers.BooleanField()
    has_edit_issue_feature = serializers.BooleanField()
    has_create_sprint = serializers.BooleanField()
    has_assign_user = serializers.BooleanField()
    has_be_scheduled = serializers.BooleanField()
    has_view_business_comments = serializers.BooleanField()
    has_view_actual_hours = serializers.BooleanField()
    has_see_other_user_points = serializers.BooleanField()
    has_estimate_own_points = serializers.BooleanField()
    has_view_calendar = serializers.BooleanField()
    has_import_actual_hours = serializers.BooleanField()
    has_edit_business_comments = serializers.BooleanField()
    has_do_dev_checklist = serializers.BooleanField()
    has_do_traffic_checklist = serializers.BooleanField()
    has_do_finance_checklist = serializers.BooleanField()
    has_edit_permissions = serializers.BooleanField()
    has_view_permissions = serializers.BooleanField()
    has_toggle_graphs = serializers.BooleanField()
    has_edit_project_detail = serializers.BooleanField()
    has_edit_deadlines = serializers.BooleanField()
    has_view_deadlines = serializers.BooleanField()
    has_edit_budget = serializers.BooleanField()
    has_view_budget = serializers.BooleanField()
    has_edit_invoices = serializers.BooleanField()
    has_view_invoices = serializers.BooleanField()
    has_edit_quotes = serializers.BooleanField()
    has_view_quotes = serializers.BooleanField()
    has_edit_ctc_billable_rates = serializers.BooleanField()
    has_view_ctc_billable_rates = serializers.BooleanField()
    has_view_ctc_rates = serializers.BooleanField()
    has_view_documents = serializers.BooleanField()
    has_edit_calendar = serializers.BooleanField()

    def to_representation(self, project_permission, *args, **kwargs):
        pp = project_permission
        pp.project_id = pp.business_id # sic
        return super(ProjectUserPermissionSerializer, self).to_representation(pp, *args, **kwargs)
 
