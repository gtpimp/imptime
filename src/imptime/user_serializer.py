import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from django.contrib.auth.models import User
from timepiece.models import BusinessPermissions
from imptime.models import Schedule
logger = logging.getLogger(__name__)

class UserSerializer(BaseSerializer):

    id = serializers.CharField()
    email = serializers.CharField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    mobile_phone_number = serializers.CharField(source="profile.mobile_phone_number")
    visible_name = serializers.CharField()
    known_user_ids = serializers.ListField(child=serializers.CharField()) # only set for the logged in user
    has_usable_password = serializers.BooleanField(source="logged_in_user_has_usable_password")
    default_schedule_id = serializers.CharField()
    is_onboarded = serializers.BooleanField(source="profile.is_onboarded")
    
    def __init__(self, *args, **kwargs):
        logged_in_user = kwargs.pop('logged_in_user', None)
        super(UserSerializer, self).__init__(*args, **kwargs)
        self.logged_in_user = logged_in_user
        
    def to_representation(self, user, *args, **kwargs):
        if self.logged_in_user:
            user.known_user_ids = BusinessPermissions.viewable_users(self.logged_in_user)\
                                                     .order_by('username')\
                                                     .values_list('id', flat=True)\
                                                     .distinct()
        else:
            user.known_user_ids = None

        if user == self.logged_in_user:
            user.logged_in_user_has_usable_password = user.has_usable_password()
        else:
            user.logged_in_user_has_usable_password = True
            
        if user.username == "gtp":
            user.visible_name = "gtp"
        else:
            user.visible_name = user.first_name + " " + user.last_name

        user.default_schedule_id = Schedule.get_default_schedule_for_user(user).id
            
        return super(UserSerializer, self).to_representation(user, *args, **kwargs)
