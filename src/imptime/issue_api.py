import logging
from issue_serializer import IssueSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class IssueViewSet(viewsets.ViewSet):

    def list(self, request):
        try:
            context = {}
            sprint_id = request.GET.get('sprint_id', None)
            issues = Issue.objects.filter(project_id=sprint_id)
            s = IssueSerializer(issues, many=True)
            context['issues'] = s.data
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))

    def retrieve(self, request, pk):
        try:
            context = {}
            sprint_id = request.GET.get('sprint_id', None)
            issues = Issue.objects.filter(project_id=sprint_id)
            issue = issues.get(pk=pk)
            s = IssueSerializer(issue)
            context['issue'] = s.data
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))
