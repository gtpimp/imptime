import os
from django.contrib.auth.models import User
from authentication import get_user_by_token
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
class VisualSpecDocumentHiresView(APIView):

    def _get_doc_field(self, visual_spec_document):
        return visual_spec_document.hires
    
    def _get(self, request, visual_spec_document_id, download=True):
        # jump through hoops because we want to download from a url
        # but the login token is normally passed in a custom header.
        user = get_user_by_token(request)
        visual_spec_document = VisualSpecDocument.objects.filter(visual_spec_projects__project__in=PermissionHelper.allowed_projects(user))\
                                                         .get(pk=visual_spec_document_id)

        bp = ProjectPermissions.for_user(user, visual_spec_document.visual_spec_projects.all()[0].project)
        if not bp.has_view_issues:
            return PermissionDenied()

        return file_helper.download_media(request,
                                          self._get_doc_field(visual_spec_document).name,
                                          content_type=visual_spec_document.content_type)
    
    def get(self, request, visual_spec_document_id):
        return self._get(request, visual_spec_document_id)

class VisualSpecDocumentPreviewView(VisualSpecDocumentHiresView):
    def get(self, request, visual_spec_document_id):
        return self._get(request, visual_spec_document_id, download=False)

    def _get_doc_field(self, visual_spec_document):
        return visual_spec_document.thumbnail
    

class VisualSpecDocumentLoresView(VisualSpecDocumentHiresView):
    def get(self, request, visual_spec_document_id):
        return self._get(request, visual_spec_document_id, download=False)

    def _get_doc_field(self, visual_spec_document):
        return visual_spec_document.lores
