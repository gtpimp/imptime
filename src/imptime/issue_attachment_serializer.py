import logging
from base_serializer import BaseSerializer
from rest_framework import serializers
from rest_framework.reverse import reverse
logger = logging.getLogger(__name__)

class IssueAttachmentSerializer(BaseSerializer):
    id = serializers.CharField(source="pk")
    name = serializers.CharField()
    download_url = serializers.CharField(source="react_download_url")
    preview_url = serializers.CharField(source="react_preview_url")
    created = serializers.DateTimeField()
    modified = serializers.DateTimeField()

    def to_representation(self, obj, *args, **kwargs):
        return super(IssueAttachmentSerializer, self).to_representation(obj, *args, **kwargs)
    
    @classmethod
    def get_download_url(self, request, attachment):
        #return self._base_url(request) + reverse('imp:download_attachment', kwargs={'attachment_id':attachment.id})
        return self._base_url(request) + '/imp/issue/attachment/%s/download?token=%s'%(attachment.id, request.auth.key)

    @classmethod
    def get_preview_url(self, request, attachment):
        #return self._base_url(request) + reverse('imp:preview_attachment', kwargs={'attachment_id':attachment.id})
        return self._base_url(request) + '/imp/issue/attachment/%s/preview?token=%s'%(attachment.id, request.auth.key)

    @classmethod
    def _base_url(self, request):
        # hack
        return reverse('home', request=request).replace('/welcome/', '')
