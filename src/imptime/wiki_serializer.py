import logging
from base_serializer import BaseModelSerializer
from rest_framework import serializers
from imptime.models import WikiPage
from imptime.models import AnnotatedVisualSpecDocument
logger = logging.getLogger(__name__)

class WikiPageSerializer(BaseModelSerializer):

    annotated_visual_spec_document_ids = serializers.ListField()
    is_root_node = serializers.BooleanField()
    order = serializers.FloatField()
    children_ids = serializers.ListField(serializers.CharField())
    
    class Meta:
        model = WikiPage
        fields = [ 'id',
                   'created',
                   'project_id',
                   'money_sensitive',
                   'name',
                   'content',
                   'children_ids',
                   'order',
                   'is_root_node',
                   'enriched_content',
                   'store_encrypted',
                   'annotated_visual_spec_document_ids',
                   'parent_id' ]

    def to_representation(self, wiki, *args, **kwargs):
        wiki.annotated_visual_spec_document_ids = AnnotatedVisualSpecDocument.objects.filter(visual_spec_wikis__wiki=wiki)\
                                                                                     .order_by("visual_spec_wikis__order")\
                                                                                     .values_list('id', flat=True)

        wiki.children_ids = [ x.id for x in wiki.children.all() ]
        project_wiki_orders = wiki.project_wiki_orders.all()
        if len(project_wiki_orders) == 0:
            wiki.order = 0
        else:
            wiki.order = project_wiki_orders[0].order
        wiki.is_root_node = wiki.parent_id is None

        return super(WikiPageSerializer, self).to_representation(wiki, *args, **kwargs)
