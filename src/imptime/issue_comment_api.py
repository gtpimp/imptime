import logging
from issue_serializer import IssueSerializer
from issue_serializer import IssueGeneralDetailsSerializer
from issue_serializer import IssueWithEstimatesSerializer
from rest_framework.decorators import detail_route
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from imptime.markdown_enrichment import MarkdownEnrichment
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueHistory
from timepiece.models import IssueComment

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class IssueCommentViewSet(BaseViewSet):

    def create(self, request):
        try:
            params = request.data
            issue_pk = params['issue_id']
            issue = self.allowed_issue(issue_pk)

            comment_value = params['comment']
            enriched_comment_value = MarkdownEnrichment(request.user).enrich(comment_value,
                                                                             project_id=issue.project.business_id) #sic

            comment = IssueComment.objects.get_or_create(issue=issue,
                                                         author=request.user,
                                                         comment=comment_value,
                                                         enriched_comment=enriched_comment_value)[0]
            issue.comments.add(comment)
            issue.save()

            IssueHistory.add_history(request.user, issue,
                                     "added comment", "", comment.comment)
            data = {'status': 'success'}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            issue_pk = params['issue_id']
            comment_id = params['comment_id']
            comment_value = params['comment']

            issue = self.allowed_issue(issue_pk)
            comment = IssueComment.objects.filter(issue=issue).get(pk=comment_id)
            old_comment_value = comment.comment
            comment.comment = comment_value
            comment.author = request.user
            comment.enriched_comment = MarkdownEnrichment(request.user).enrich(comment.comment,
                                                                               project_id=issue.project.business_id) #sic
            
            IssueHistory.add_history(request.user, issue, "edited comment",
                                     old_comment_value, comment.comment)

            comment.save()
            issue.save()
            data = {'status': 'success'}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def delete(self, request, pk):
        try:
            params = request.data
            issue_pk = params['issue_id']
            comment_id = params['comment_id']
            issue = self.allowed_issue(issue_pk)
            comment = IssueComment.objects.filter(issue=issue).get(pk=comment_id)
            IssueHistory.add_history(request.user, issue, "deleted comment", comment.comment, "")
            comment.delete()
            issue.save()

            data = {'status': 'success'}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
