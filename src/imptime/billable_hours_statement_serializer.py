import logging
from .base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)

class BillableHoursStatementFilterSerializer(BaseSerializer):

    date_to_inclusive = serializers.DateTimeField(allow_null=True, required=False)
    date_from_inclusive = serializers.DateTimeField(required=False, allow_null=True)
    
