import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
from timepiece.models import BusinessPermissions
logger = logging.getLogger(__name__)


class ProjectSerializer(BaseSerializer):

    id = serializers.CharField()
    name = serializers.CharField()
    allowed_user_ids = serializers.ListField()

    def __init__(self, *args, **kwargs):
        logged_in_user = kwargs.pop('logged_in_user')
        super(ProjectSerializer, self).__init__(*args, **kwargs)
        self.logged_in_user = logged_in_user

    def to_representation(self, project, *args, **kwargs):
        project_users = BusinessPermissions.viewable_users_for_business(
            logged_in_user=self.logged_in_user, business_id=project.id)
        project.allowed_user_ids = \
            [str(x.id) for x in project_users.order_by("username")]
        return super(ProjectSerializer, self).to_representation(
            project, *args, **kwargs)
