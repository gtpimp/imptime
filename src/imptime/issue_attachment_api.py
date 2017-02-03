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

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class IssueAttachmentViewSet(BaseViewSet):

    def create(self, request):
        try:
            params = request.data
            issue_pk = params['issue_id']
            attachment_value = params['attachment']
            
            issue = self.allowed_issue(issue_pk)
            attachment = IssueAttachment.objects.get_or_create(issue=issue,
                                                         author=request.user,
                                                         attachment=attachment_value)[0]
            issue.attachments.add(attachment)
            issue.save()

            IssueHistory.add_history(request.user, issue,
                                     "added attachment %s"%attachment.id, "", attachment.attachment)
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

