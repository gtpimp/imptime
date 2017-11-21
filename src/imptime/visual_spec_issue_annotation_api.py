import logging
from visual_spec_issue_serializer import VisualSpecIssueSerializer
from django_downloadview import HTTPDownloadView
from django.contrib.auth.decorators import login_required
from visual_spec_issue_annotation_serializer import VisualSpecIssueAnnotationSerializer
from visual_spec_issue_annotation_serializer import VisualSpecIssueAnnotationInboundSerializer
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
from timepiece.models import Issue, IssueStatus, IssueHistory
from imptime.models import VisualSpecIssueAnnotation, VisualSpecIssue

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class VisualSpecIssueAnnotationViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            visual_spec_issue_annotations = self.allowed_visual_spec_issue_annotations()
            visual_spec_issue_annotations = self.apply_filter(qs=visual_spec_issue_annotations,
                                                              raw_filter_args=filter_args)
            visual_spec_issue_annotations = self.apply_pagination(qs=visual_spec_issue_annotations,
                                                                  pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in visual_spec_issue_annotations.values_list(
                    'id', flat=True)]
            else:
                s = VisualSpecIssueAnnotationSerializer(visual_spec_issue_annotations, many=True)
                visual_spec_issue_annotations_data = s.data
                context['visual_spec_issue_annotations'] = visual_spec_issue_annotations_data
                
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
    
    def create(self, request):
        try:
            params = request.data['item']
            visual_spec_document_id = params['visual_spec_document_id']
            self.allowed_visual_spec_documents().get(pk=visual_spec_document_id)
            issue_id = params['issue_id']
            issue = self.allowed_issues().get(pk=issue_id)
            visual_spec_issue = VisualSpecIssue.objects.get(issue_id=issue_id,
                                                            visual_spec_document_id=visual_spec_document_id)
            s = VisualSpecIssueAnnotationInboundSerializer(data=params)
            if s.is_valid():
                annotation = s.save(visual_spec_issue=visual_spec_issue)
                issue.save()
            else:
                return self.error_response(Exception("Invalid post data: %s" % s.errors))
            
            data = {'status': 'success',
                    'payload': {'item':VisualSpecIssueAnnotationSerializer(instance=annotation).data}}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            visual_spec_issue_annotation_ids = params.get('visual_spec_issue_annotation_ids', [pk])
            self.allowed_issue(params['value']['issue_id'])
            self.allowed_visual_spec_documents().get(pk=params['value']['visual_spec_document_id'])
            items = []
            for vsia_id in visual_spec_issue_annotation_ids:
                visual_spec_issue_annotation = self.allowed_visual_spec_issue_annotations().get(pk=vsia_id)
                s = VisualSpecIssueAnnotationInboundSerializer(instance=visual_spec_issue_annotation, data=params['value'])
                if s.is_valid():
                    s.save()
                items.append(visual_spec_issue_annotation)

            s = VisualSpecIssueAnnotationSerializer(items, many=True)
            context = {'items': s.data}
            data = {'status': 'success',
                    'payload': context}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))
    
    # def delete(self, request, pk):
    #     try:
    #         params = request.data
    #         visual_spec_issue_id = params['visual_spec_issue_id']
    #         visual_spec_issue = self.allowed_visual_spec_issues().filter(pk=visual_spec_issue_id)
    #         visual_spec_issue.delete()
    #         issue = self.allowed_issues().get(pk=visual_spec_issue.issue_id)
    #         issue.delete()
    #         data = {'status': 'success'}
    #     except Exception, ex:
    #         logger.exception(ex)
    #         return self.error_response(ex)
        
    #     return HttpResponse(JSONRenderer().render(data))
