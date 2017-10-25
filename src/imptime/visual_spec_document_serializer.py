import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
from rest_framework.reverse import reverse
logger = logging.getLogger(__name__)

class VisualSpecDocumentDownloadSerializer(BaseSerializer):
    id = serializers.CharField(source="pk")
    name = serializers.CharField()
    download_url = serializers.CharField(source="react_download_url")
    preview_url = serializers.CharField(source="react_preview_url")
    created = serializers.DateTimeField()
    modified = serializers.DateTimeField()

    @classmethod
    def get_download_url(self, request, visual_spec_document):
        return self._base_url(request) + '/imp/visual_spec_document/%s/download?token=%s'%(visual_spec_document.id, request.user.profile.authenticate_token)

    @classmethod
    def get_preview_url(self, request, visual_spec_document):
        return self._base_url(request) + '/imp/visual_spec_document/%s/preview?token=%s'%(visual_spec_document.id, request.user.profile.authenticate_token)

    @classmethod
    def _base_url(self, request):
        return reverse('home', request=request).replace('/welcome/', '')


class VisualSpecDocumentSerializer(BaseSerializer):
    id = serializers.CharField(source="pk")
    name = serializers.CharField()
    issue_id = serializers.CharField()
    image_url = serializers.CharField()
    visual_spec_issue_ids = serializers.ListField(child=serializers.CharField())
    issue_ids = serializers.ListField(child=serializers.CharField())

    def to_representation(self, obj, *args, **kwargs):
        obj.visual_spec_issue_ids = obj.visual_spec_issues.all().values_list('id', flat=True)
        obj.issue_ids = obj.visual_spec_issues.all().values_list('issue_id', flat=True)
        return super(VisualSpecDocumentSerializer, self).to_representation(obj, *args, **kwargs)
    
    @classmethod
    def get_image_url(self, request, visual_spec_document):
        return VisualSpecDocumentDownloadSerializer.get_preview_url(request, visual_spec_document)
    
