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
from testable.models import Testable

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class TestableViewSet(BaseViewSet):

    def create(self, request):
        try:
            params = request.data
            issue_pk = params['issue_id']
            testable_value = params['testable']
            issue = self.allowed_issue(issue_pk)
            testables = issue.testables.all().order_by('order').values_list('order', flat=True)
            max_order = 0
            if testables:
                max_order = max(testables)

            testable = Testable.objects.get_or_create(issue=issue,
                                                      steps=testable_value,
                                                      order=max_order)[0]
            issue.save()
            IssueHistory.add_history(request.user, issue,
                                     "added testable %s" % testable.id, "", testable.steps)
            data = {'status': 'success'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            issue_pk = params['issue_id']
            testable_id = params['testable_id']
            testable_value = params['testable']

            issue = self.allowed_issue(issue_pk)
            testable = Testable.objects.filter(issue=issue).get(pk=testable_id)
            old_testable_value = testable.steps
            testable.steps = testable_value

            IssueHistory.add_history(request.user, issue, "edited testable %s" % testable_id,
                                     old_testable_value, testable.steps)
            testable.save()
            issue.save()
            data = {'status': 'success'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def delete(self, request, pk):
        try:
            params = request.data
            issue_pk = params['issue_id']
            testable_id = params['testable_id']
            issue = self.allowed_issue(issue_pk)
            testable = Testable.objects.filter(issue=issue).get(pk=testable_id)
            IssueHistory.add_history(request.user, issue, "deleted testable %s" % testable.id, testable.steps, "")
            testable.delete()
            issue.save()

            data = {'status': 'success'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
