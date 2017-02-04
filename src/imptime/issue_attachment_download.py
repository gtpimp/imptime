import os
from django.contrib.auth.models import User
from django.conf import settings
from django.http import HttpResponse
from timepiece.models import Issue, IssueHistory
from timepiece.models import IssueAttachment
from rest_framework.decorators import permission_classes
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from base_api import PermissionHelper
from django.contrib.sessions.models import Session


@permission_classes(())
class IssueAttachmentDownloadView(APIView):

    def _get(self, request, attachment_id, content_type, download=True):
        # jump through hoops because we want to download from a url
        # but the login token is normally passed in a custom header.
        token = request.GET['token']
        session = Session.objects.get(pk=request.COOKIES['sessionid'])
        s_data = session.get_decoded()
        user_id = s_data.get('_auth_user_id')
        user = User.objects.get(pk=user_id, profile__authenticate_token=token)
        attachment = IssueAttachment.objects.filter(issue__in=PermissionHelper.allowed_issues(user)).get(pk=attachment_id)
        filepath = os.path.join(attachment.attachment.path)

        response = HttpResponse(
            open(filepath, 'rb'),
            content_type=content_type
        )
        if download:
            response['Content-Disposition'] = 'attachment; filename="%s"' % os.path.basename(attachment.name)
        response['Content-Length'] = os.stat(filepath).st_size
        return response
        
    
    def get(self, request, attachment_id):
        return self._get(request, attachment_id, content_type='image/jpeg')

class IssueAttachmentPreviewView(IssueAttachmentDownloadView):

    def get(self, request, attachment_id):
        return self._get(request, attachment_id, content_type='image/jpeg', download=False)
