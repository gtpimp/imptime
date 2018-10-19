import logging
from base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import WikiPage
logger = logging.getLogger(__name__)

class WikiPageSerializer(BaseModelSerializer):

    class Meta:
        model = WikiPage
        fields = [ 'id',
                   'project_id',
                   'money_sensitive',
                   'name',
                   'content',
                   'enriched_content',
                   'store_encrypted' ]
        
