import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
from rest_framework.reverse import reverse
logger = logging.getLogger(__name__)

class VisualSpecDocumentSerializer(BaseSerializer):
    id = serializers.CharField(source="pk")
    name = serializers.CharField()
    download_url = serializers.CharField()
    hires_url = serializers.CharField()
    medium_res_url = serializers.CharField()
    preview_url = serializers.CharField()
    hires_width = serializers.IntegerField()
    hires_height = serializers.IntegerField()
    content_type = serializers.CharField()
    is_image = serializers.BooleanField()
    visual_spec_project_ids = serializers.ListField(child=serializers.CharField())
    project_ids = serializers.ListField(serializers.CharField())

    def to_representation(self, obj, *args, **kwargs):
        obj.visual_spec_project_ids = obj.visual_spec_projects.all().values_list('id', flat=True)
        obj.project_ids = obj.visual_spec_project_ids.all().values_list('project_id', flat=True)
        return super(VisualSpecDocumentSerializer, self).to_representation(obj, *args, **kwargs)

    @classmethod
    def get_download_url(self, request, visual_spec_document):
        return 'imp/visual_spec_document/%s/download'%(visual_spec_document.id)
    
    @classmethod
    def get_hires_url(self, request, visual_spec_document):
        return 'imp/visual_spec_document/%s/hires'%(visual_spec_document.id)

    @classmethod
    def get_medium_res_url(self, request, visual_spec_document):
        return 'imp/visual_spec_document/%s/medium_res'%(visual_spec_document.id)
    
    @classmethod
    def get_preview_url(self, request, visual_spec_document):
        if not visual_spec_document.thumbnail.name:
            return "no_preview_available__%s" % visual_spec_document.content_type
        return 'imp/visual_spec_document/%s/preview'%(visual_spec_document.id)

    @classmethod
    def _base_url(self, request):
        return reverse('home', request=request).replace('/welcome/', '')
    
