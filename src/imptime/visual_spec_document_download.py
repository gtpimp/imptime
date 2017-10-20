import os
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from timepiece.models import BusinessPermissions as ProjectPermissions
from django.conf import settings
from django.http import HttpResponse
from timepiece.models import Issue, IssueHistory
from rest_framework.decorators import permission_classes
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from base_api import PermissionHelper
from django.contrib.sessions.models import Session
from lib import file_helper
from imptime.models import VisualSpecDocument

@permission_classes(())
class VisualSpecDocumentDownloadView(APIView):

    def _get(self, request, visual_spec_document_id, download=True):
        # jump through hoops because we want to download from a url
        # but the login token is normally passed in a custom header.
        token = request.GET['token']
        session = Session.objects.get(pk=request.COOKIES['sessionid'])
        s_data = session.get_decoded()
        user_id = s_data.get('_auth_user_id')
        user = User.objects.get(pk=user_id, profile__authenticate_token=token)
        visual_spec_document = VisualSpecDocument.objects.filter(issue__in=PermissionHelper.allowed_issues(user)).get(pk=visual_spec_document_id)

        bp = ProjectPermissions.for_user(user, visual_spec_document.issue.project.business)
        if not bp.has_view_issues:
            return PermissionDenied()

        return file_helper.download_media(request,
                                          visual_spec_document.document.name,
                                          content_type=visual_spec_document.content_type)
    
    def get(self, request, visual_spec_document_id):
        return self._get(request, visual_spec_document_id)

class VisualSpecDocumentPreviewView(VisualSpecDocumentDownloadView):

    def get(self, request, visual_spec_document_id):
        return self._get(request, visual_spec_document_id, download=False)
