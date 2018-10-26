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
        return self._base_url(request) + '/imp/visual_spec_document/%s/download?token=%s'%(visual_spec_document.id, request.auth.key)
    
    @classmethod
    def get_hires_url(self, request, visual_spec_document):
        return self._base_url(request) + '/imp/visual_spec_document/%s/hires?token=%s'%(visual_spec_document.id, request.auth.key)

    @classmethod
    def get_preview_url(self, request, visual_spec_document):
        import pdb; pdb.set_trace()
        if not visual_spec_document.thumbnail.name:
            return "no_preview_available__%s" % visual_spec_document.content_type
        return self._base_url(request) + '/imp/visual_spec_document/%s/preview?token=%s'%(visual_spec_document.id, request.auth.key)

    @classmethod
    def _base_url(self, request):
        return reverse('home', request=request).replace('/welcome/', '')
    
