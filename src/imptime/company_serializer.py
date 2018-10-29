import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from timepiece.models import CompanyPermissions
from company_user_permission_serializer import CompanyUserPermissionSerializer
logger = logging.getLogger(__name__)


class CompanySerializer(BaseSerializer):
    id = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
    allowed_user_ids = serializers.ListField(child=serializers.CharField())
    logged_in_users_permissions = CompanyUserPermissionSerializer(source='user_permissions')
    can_delete_company = serializers.SerializerMethodField('is_company_deletable')
    
    def is_company_deletable(self, company):
        return False
    
    def __init__(self, *args, **kwargs):
        logged_in_user = kwargs.pop('logged_in_user')
        super(CompanySerializer, self).__init__(*args, **kwargs)
        self.logged_in_user = logged_in_user

    def to_representation(self, company, *args, **kwargs):
        company.user_permissions = CompanyPermissions.for_user(user=self.logged_in_user,
                                                               company=company,
                                                               auto_create=False) 
        return super(CompanySerializer, self).to_representation(
            company, *args, **kwargs)
