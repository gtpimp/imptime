import logging
from rest_framework import serializers
from base_serializer import BaseModelSerializer
from django.contrib.auth.models import User
logger = logging.getLogger(__name__)


class UserSerializer(BaseModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')

    id = serializers.CharField()
