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
        return self._base_url(request) + '/imp/issue/visual_spec_document/%s/download?token=%s'%(visual_spec_document.id, request.user.profile.authenticate_token)

    @classmethod
    def get_preview_url(self, request, visual_spec_document):
        return self._base_url(request) + '/imp/issue/visual_spec_document/%s/preview?token=%s'%(visual_spec_document.id, request.user.profile.authenticate_token)

    @classmethod
    def _base_url(self, request):
        return reverse('home', request=request).replace('/welcome/', '')


class VisualIssueSerializer(BaseSerializer):
    issue_id = serializers.CharField()
    order = serializers.IntegerField()
    shape = serializers.CharField()
    x_pos = serializers.IntegerField()
    y_pos = serializers.IntegerField()


class VisualSpecDocumentSerializer(BaseSerializer):
    id = serializers.CharField(source="pk")
    name = serializers.CharField()
    issue_id = serializers.CharField()
    image_url = serializers.CharField()
    visual_issues = VisualIssueSerializer(many=True, source="visual_issues.all")
    
    @classmethod
    def get_image_url(self, request, visual_spec_document):
        return VisualSpecDocumentDownloadSerializer.get_preview_url(request, visual_spec_document)
    
