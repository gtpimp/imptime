import logging
from issue_serializer import IssueSerializer
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
from django.core.files import File as DjangoFile

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class IssueAttachmentViewSet(BaseViewSet):

    def create(self, request):
        try:
            issue_pk = request.POST['issue_id']
            issue = self.allowed_issue(issue_pk)
            for name, f in request.FILES.items():
                attachment = IssueAttachment.objects.create(issue=issue, attachment=f, name=f.name)
                issue.attachments.add(attachment)
                issue.save()
                IssueHistory.add_history(request.user, issue, "added attachment", "", f.name)
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))
    
    def delete(self, request, pk):
        try:
            params = request.data
            issue_pk = params['issue_id']
            attachment_id = params['attachment_id']
            issue = self.allowed_issue(issue_pk)
            attachment = IssueAttachment.objects.filter(issue=issue).get(pk=attachment_id)
            IssueHistory.add_history(request.user, issue, "deleted attachment %s"%attachment.id, attachment.attachment, "")
            attachment.delete()
            issue.save()

            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['GET'])
    def download(self, request, attachment_id):
        try:
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
