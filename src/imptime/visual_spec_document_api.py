import logging
from issue_serializer import IssueSerializer
import PIL
from django_downloadview import HTTPDownloadView
from django.contrib.auth.decorators import login_required
from visual_spec_document_serializer import VisualSpecDocumentSerializer
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
from timepiece.models import IssueHistory
from imptime.models import VisualSpecDocument

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class VisualSpecDocumentViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            visual_spec_documents = self.allowed_visual_spec_documents().order_by("order", "id")
            visual_spec_documents = self.apply_filter(qs=visual_spec_documents,
                                                      raw_filter_args=filter_args)
            visual_spec_documents = self.apply_pagination(qs=visual_spec_documents,
                                                          pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in visual_spec_documents.values_list(
                    'id', flat=True)]
            else:

                for vsd in visual_spec_documents:
                    vsd.download_url = VisualSpecDocumentSerializer.get_hires_url(self.request, vsd)
                    vsd.hires_url = vsd.download_url
                    vsd.lores_url = VisualSpecDocumentSerializer.get_lores_url(self.request, vsd)
                    vsd.preview_url = VisualSpecDocumentSerializer.get_preview_url(self.request, vsd)
                
                s = VisualSpecDocumentSerializer(visual_spec_documents, many=True)
                visual_spec_documents_data = s.data
                context['visual_spec_documents'] = visual_spec_documents_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
    
    def create(self, request):
        try:
            issue_pk = request.POST['issue_id']
            issue = self.allowed_issue(issue_pk)
            for name, f in request.FILES.items():
                if not f.content_type.startswith('image'):
                    raise Exception("Document must be an image, not %s" % f.content_type)
                width, height = PIL.Image.open(f).size
                VisualSpecDocument.objects.create(issue=issue,
                                                  hires=f,
                                                  lores=f,
                                                  hires_width=width,
                                                  hires_height=height,
                                                  thumbnail=f,
                                                  name=f.name,
                                                  content_type=f.content_type)
                issue.save()
                IssueHistory.add_history(request.user, issue, "added visual spec document", "", f.name)
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params['value']

            visual_spec_document_ids = params.pop('issue_ids', [pk])

            for vsd_id in visual_spec_document_ids:
                vsd = self.allowed_visual_spec_documents().get(pk=vsd_id) 

                if field_name == 'visual_spec_document_id_after':
                    after_vsd = self.allowed_visual_spec_documents().get(pk=new_value)
                    vsd.move_after(after_vsd)
                else:
                    raise Exception("Unsupported field name: %s" % field_name)

            data = {'status': 'success', 'payload': visual_spec_document_ids}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
    
    def delete(self, request, pk):
        try:
            params = request.data
            issue_pk = params['issue_id']
            visual_spec_document_id = pk
            issue = self.allowed_issue(issue_pk)
            visual_spec_document = VisualSpecDocument.objects.filter(issue=issue).get(pk=visual_spec_document_id)
            IssueHistory.add_history(request.user,
                                     issue,
                                     "deleted visual spec document %s"%visual_spec_document.id,
                                     visual_spec_document.hires.name,
                                     "")
            visual_spec_document.delete()
            issue.save()
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
