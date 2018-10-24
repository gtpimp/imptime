import logging
from base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import WikiPage
from imptime.models import AnnotatedVisualSpecDocument
logger = logging.getLogger(__name__)

class WikiPageSerializer(BaseModelSerializer):

    annotated_visual_spec_document_ids = serializers.ListField()
    
    class Meta:
        model = WikiPage
        fields = [ 'id',
                   'project_id',
                   'money_sensitive',
                   'name',
                   'content',
                   'enriched_content',
                   'store_encrypted',
                   'annotated_visual_spec_document_ids' ]
        

    def to_representation(self, wiki, *args, **kwargs):
        wiki.annotated_visual_spec_document_ids = AnnotatedVisualSpecDocument.objects.filter(visual_spec_wikis__wiki=wiki)\
                                                                                     .order_by("visual_spec_wikis__order")\
                                                                                     .values_list('id', flat=True)
        return super(WikiPageSerializer, self).to_representation(wiki, *args, **kwargs)
    
        
