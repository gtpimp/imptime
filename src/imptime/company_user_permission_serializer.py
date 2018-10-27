import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)

class CompanyUserPermissionSerializer(BaseSerializer):

    id = serializers.CharField()
    company_id = serializers.CharField()
    user_id = serializers.CharField()
    
    is_active_member_of_company = serializers.BooleanField()
    has_invite_users = serializers.BooleanField()
    has_set_user_permissions = serializers.BooleanField()
    has_edit_company_info = serializers.BooleanField()
