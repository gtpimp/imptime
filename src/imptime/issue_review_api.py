import logging
from .issue_review_serializer import IssueReviewSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from .base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class IssueReviewViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            issue_reviews = self.allowed_issue_reviews().order_by("last_reviewed_at")
            issue_reviews = self.apply_filter(qs=issue_reviews,
                                              raw_filter_args=filter_args)
            issue_reviews = self.apply_pagination(qs=issue_reviews,
                                                  pagination=pagination)
            
            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in issue_reviews.values_list(
                    'id', flat=True)]
            else:
                s = IssueReviewSerializer(issue_reviews, many=True, logged_in_user=request.user)
                context['issue_reviews'] = s.data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

