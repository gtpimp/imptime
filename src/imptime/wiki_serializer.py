import logging
from base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import WikiPage
logger = logging.getLogger(__name__)

class WikiPageSerializer(BaseModelSerializer):

    project_id = serializers.CharField(source="default_project_id")
    
    class Meta:
        model = WikiPage
        fields = [ 'id',
                   'project_id',
                   'money_sensitive',
                   'name',
                   'content' ]
        
