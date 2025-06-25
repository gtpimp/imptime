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
from timepiece.models import Issue, IssueHistory, IssuePoints

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class IssueEstimateViewSet(BaseViewSet):

    def create(self, request):
        try:
            params = request.data
            estimate_hours = params['estimate_hours']
            issue_pks = params['issue_ids']
            user = request.user

            for issue_pk in issue_pks:
                issue = self.allowed_issue(issue_pk)
                points = IssuePoints.objects.get_or_create(user=user, issue=issue)[0]
                old_points = points.points
                points.points = float(estimate_hours)
                points.save()
                IssueHistory.add_history(user, points.issue,
                                         "changed estimate for %s"%points.user,
                                         old_points, points.points)
                issue.save()

            data = {'status': 'success'}
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))
    
