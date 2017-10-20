import os
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from timepiece.models import BusinessPermissions as ProjectPermissions
from django.conf import settings
from django.http import HttpResponse
from timepiece.models import Issue, IssueHistory
from timepiece.models import IssueAttachment
from rest_framework.decorators import permission_classes
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from base_api import PermissionHelper
from django.contrib.sessions.models import Session
from lib import file_helper

@permission_classes(())
class IssueAttachmentDownloadView(APIView):

    def _get(self, request, attachment_id, download=True):
        # jump through hoops because we want to download from a url
        # but the login token is normally passed in a custom header.
        token = request.GET['token']
        session = Session.objects.get(pk=request.COOKIES['sessionid'])
        s_data = session.get_decoded()
        user_id = s_data.get('_auth_user_id')
        user = User.objects.get(pk=user_id, profile__authenticate_token=token)
        attachment = IssueAttachment.objects.filter(issue__in=PermissionHelper.allowed_issues(user)).get(pk=attachment_id)

        bp = ProjectPermissions.for_user(user, attachment.issue.project.business)
        if not bp.has_view_issues:
            return PermissionDenied()

        return file_helper.download_media(request,
                                          attachment.attachment.name,
                                          content_type=attachment.content_type)
    
    def get(self, request, attachment_id):
        return self._get(request, attachment_id)

class IssueAttachmentPreviewView(IssueAttachmentDownloadView):

    def get(self, request, attachment_id):
        return self._get(request, attachment_id, download=False)
