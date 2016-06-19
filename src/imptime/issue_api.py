import logging
from issue_serializer import IssueSerializer
from issue_serializer import IssueGeneralDetailsSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class IssueViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            issues = Issue.objects.all()
            issues = self.apply_filter(qs=issues,
                                       raw_filter_args=filter_args)
            issues = self.apply_pagination(qs=issues,
                                           pagination=pagination)

            if format_args.get('ids_only', None):
                context['ids'] = [str(x) for x in issues.values_list(
                    'id', flat=True)]
            else:

                detail_level = format_args.get('detail_level', None)
                if detail_level is None:
                    s = IssueSerializer(issues, many=True)
                elif detail_level == 'general':
                    s = IssueGeneralDetailsSerializer(issues, many=True)

                issues_data = s.data
                context['issues'] = issues_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data))
