import logging
from issue_serializer import IssueSerializer
from django_downloadview import HTTPDownloadView
from django.contrib.auth.decorators import login_required
from issue_serializer import IssueGeneralDetailsSerializer
from issue_serializer import IssueWithEstimatesSerializer
from rest_framework.decorators import detail_route
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory
from timepiece.models import IssueAttachment
from imptime.models import VisualSpecDocument
from django.core.files import File as DjangoFile

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class VisualSpecDocumentViewSet(BaseViewSet):

    def create(self, request):
        try:
            issue_pk = request.POST['issue_id']
            issue = self.allowed_issue(issue_pk)
            for name, f in request.FILES.items():
                VisualSpecDocument.objects.create(issue=issue,
                                                  document=f,
                                                  name=f.name,
                                                  content_type=f.content_type)
                issue.save()
                IssueHistory.add_history(request.user, issue, "added visual spec document", "", f.name)
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        # This function is required for the 'delete' to register as a
        # url, this seems like a bug in DjangoRestFramework
        raise Exception("Not supported")
    
    def delete(self, request, pk):
        try:
            params = request.data
            issue_pk = params['issue_id']
            visual_spec_document_id = pk
            issue = self.allowed_issue(issue_pk)
            visual_spec_document = VisualSpecDocument.objects.filter(issue=issue).get(pk=visual_spec_document_id)
            IssueHistory.add_history(request.user,
                                     issue,
                                     "deleted visual spec document %s"%visual_spec_document.id,
                                     visual_spec_document.visual_spec_document,
                                     "")
            visual_spec_document.delete()
            issue.save()
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
