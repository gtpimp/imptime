import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from django.contrib.auth.models import User
from timepiece.models import BusinessPermissions
logger = logging.getLogger(__name__)


class UserSerializer(BaseSerializer):

    id = serializers.CharField()
    email = serializers.CharField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    known_user_ids = serializers.ListField(child=serializers.CharField())
    
    def __init__(self, *args, **kwargs):
        logged_in_user = kwargs.pop('logged_in_user', None)
        super(UserSerializer, self).__init__(*args, **kwargs)
        self.logged_in_user = logged_in_user
        
    def to_representation(self, issue, *args, **kwargs):

        if self.logged_in_user:
            allowed_business_ids = self.logged_in_user.business_permissions.values_list('business_id', flat=True)
            other_bps = BusinessPermissions.objects\
                                           .filter(business__in=allowed_business_ids,
                                                   is_active_member_of_business=True)\
                                           .exclude(user_id=self.logged_in_user.id)
                        
            issue.known_user_ids = other_bps.order_by('user__username').order_by('user_id').values_list('user__id', flat=True).distinct()
        else:
            issue.known_user_ids = None
            
        return super(UserSerializer, self).to_representation(issue, *args, **kwargs)
        
        
