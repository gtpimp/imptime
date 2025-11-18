import logging
from .visual_spec_issue_serializer import VisualSpecIssueSerializer
from django_downloadview import HTTPDownloadView
from django.contrib.auth.decorators import login_required

from rest_framework.decorators import detail_route
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum
from .base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue, IssueStatus, IssueHistory
from imptime.models import VisualSpecIssue

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class VisualSpecIssueViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            visual_spec_issues = self.allowed_visual_spec_issues()
            visual_spec_issues = self.apply_filter(qs=visual_spec_issues,
                                                      raw_filter_args=filter_args)
            visual_spec_issues = self.apply_pagination(qs=visual_spec_issues,
                                                          pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in visual_spec_issues.values_list(
                    'id', flat=True)]
            else:
                s = VisualSpecIssueSerializer(visual_spec_issues, many=True)
                visual_spec_issues_data = s.data
                context['visual_spec_issues'] = visual_spec_issues_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
    
    def create(self, request):
        try:
            params = json.loads(request.body)
            visual_spec_document_id = params['visual_spec_document_id']
            visual_spec_document = self.allowed_visual_spec_documents().get(pk=visual_spec_document_id)
            s = VisualSpecIssueSerializer(data=params)
            if s.is_valid():
                parent_issue = visual_spec_document.issue
                if not parent_issue.can_group_issues:
                    parent_issue.can_group_issues = True
                    parent_issue.save()
                    IssueHistory.add_history(request.user, parent_issue, "issue can group", "", "1")
                new_issue_order=parent_issue.get_next_child_order()
                issue = Issue.objects.create(project=parent_issue.project,
                                             subject="",
                                             issue_type='issue',
                                             status2=IssueStatus.objects.get_or_create(name='new', business=parent_issue.project.business)[0],
                                             parent_group=visual_spec_document.issue,
                                             assigned_to=parent_issue.assigned_to,
                                             number=Issue.get_next_issue_number(visual_spec_document.issue.project.business),
                                             order=new_issue_order)
                parent_issue.renumber_issue_order()
                visual_spec_issue = s.save(issue=issue)
                parent_issue.save()
            else:
                return self.error_response(Exception("Invalid post data: %s" % s.errors))
            
            data = {'status': 'success',
                    'payload': {'visual_spec_issue':VisualSpecIssueSerializer(instance=visual_spec_issue).data}}
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = json.loads(request.body)
            visual_spec_issue_ids = params.pop('visual_spec_issue_ids')
            self.allowed_visual_spec_documents().get(pk=params['visual_spec_document_id'])
            visual_spec_issues = self.allowed_visual_spec_issues().filter(pk__in=visual_spec_issue_ids)
            for vsi in visual_spec_issues:
                params['id'] = vsi.id
                params['issue_id'] = vsi.issue_id
                s = VisualSpecIssueSerializer(data=params, instance=vsi)
                if s.is_valid():
                    s.save()
                else:
                    return self.error_response(Exception("Invalid post data: %s" % s.errors))

            s = VisualSpecIssueSerializer(visual_spec_issues, many=True)
            visual_spec_issues_data = s.data
            context = {'visual_spec_issues': visual_spec_issues_data}
                
            data = {'status': 'success',
                    'payload': context}
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))
    
    def delete(self, request, pk):
        try:
            params = request.data
            visual_spec_issue_id = params['visual_spec_issue_id']
            visual_spec_issue = self.allowed_visual_spec_issues().filter(pk=visual_spec_issue_id)
            visual_spec_issue.delete()
            issue = self.allowed_issues().get(pk=visual_spec_issue.issue_id)
            issue.delete()
            data = {'status': 'success'}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
