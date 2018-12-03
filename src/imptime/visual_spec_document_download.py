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
class VisualSpecDocumentBase(APIView):

    def get_visual_spec_document(self, request, visual_spec_document_id):
        # jump through hoops because we want to download from a url
        # but the login token is normally passed in a custom header.
        user = get_user_by_token(request)
        visual_spec_document = VisualSpecDocument.objects.filter(visual_spec_projects__project__in=PermissionHelper.allowed_projects(user),
                                                                 pk=visual_spec_document_id)\
                                                         .order_by("-id").first()
        bp = ProjectPermissions.for_user(user, visual_spec_document.visual_spec_projects.all()[0].project)
        if not bp.has_view_issues:
            return None
        return visual_spec_document

    def fetch_file(self, request, url, visual_spec_document, download=True):
        return file_helper.download_media(request, url,
                                          content_type=visual_spec_document.content_type,
                                          filename=visual_spec_document.name,
                                          as_attachment=download)

class VisualSpecDocumentDownloadView(VisualSpecDocumentBase):
    def get(self, request, visual_spec_document_id):
        vsd = self.get_visual_spec_document(request, visual_spec_document_id)
        if vsd is None:
            return PermissionDenied()
        url = vsd.original_doc.name
        return self.fetch_file(request, url, vsd, download=True)


class VisualSpecDocumentHiresView(VisualSpecDocumentBase):
    def get(self, request, visual_spec_document_id):
        vsd = self.get_visual_spec_document(request, visual_spec_document_id)
        if vsd is None:
            return PermissionDenied()
        download = False
        url = vsd.hires.name
        if not url:
            # If no hires then this isn't an image, so switch to downloading it.
            url = vsd.original_doc.name
            download = True
        return self.fetch_file(request, url, vsd, download=download)

class VisualSpecDocumentMediumResPreviewView(VisualSpecDocumentBase):
    def get(self, request, visual_spec_document_id):
        vsd = self.get_visual_spec_document(request, visual_spec_document_id)
        if vsd is None:
            return PermissionDenied()
        download = False
        vsd.medium_res.url
        url = vsd.medium_res.name
        if not url:
            # If no hires then this isn't an image, so switch to downloading it.
            url = vsd.original_doc.name
            download = True
        return self.fetch_file(request, url, vsd, download=download)

class VisualSpecDocumentPreviewView(VisualSpecDocumentBase):
    def get(self, request, visual_spec_document_id):
        vsd = self.get_visual_spec_document(request, visual_spec_document_id)
        if vsd is None:
            return PermissionDenied()
        url = vsd.thumbnail.name
        if not url:
            return HttpResponse("no_preview_available")
            
        return self.fetch_file(request, url, vsd, download=False)

