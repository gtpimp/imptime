import logging
from issue_history_serializer import IssueHistorySerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Project as Sprint
from timepiece.models import Business as Project
from timepiece.models import BusinessPermissions as ProjectPermissions
from timepiece.models import IssueHistory
from imptime.models import SprintTemplate
from rest_framework.decorators import detail_route

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class IssueHistoryViewSet(BaseViewSet):

    def list(self, request):

        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})
            issue_histories = self.allowed_issue_histories().order_by("created")
            issue_histories = self.apply_filter(qs=issue_histories, raw_filter_args=filter_args)
            issue_histories = self.apply_pagination(qs=issue_histories, pagination=pagination)
            
            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in issue_histories.values_list('id', flat=True)]
            else:
                s = IssueHistorySerializer(issue_histories, many=True)
                issue_histories_data = s.data
                context['items'] = issue_histories_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
