import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class ProjectStatementFilterSerializer(BaseSerializer):

    date_to_inclusive = serializers.DateTimeField()
    date_from_inclusive = serializers.DateTimeField()
    
