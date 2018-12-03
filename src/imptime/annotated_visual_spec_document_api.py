import logging
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from visual_spec_document_serializer import VisualSpecDocumentSerializer
from annotated_visual_spec_document_serializer import AnnotatedVisualSpecDocumentSerializer
from imptime.models import FeatureHistory, IssueHistory

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class AnnotatedVisualSpecDocumentViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            annotated_visual_spec_documents = self.allowed_annotated_visual_spec_documents()
            annotated_visual_spec_documents = self.apply_filter(qs=annotated_visual_spec_documents,
                                                                raw_filter_args=filter_args)
            annotated_visual_spec_documents = self.apply_pagination(qs=annotated_visual_spec_documents,
                                                                    pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in annotated_visual_spec_documents.values_list(
                    'id', flat=True)]
            else:

                annotated_visual_spec_documents
                
                for vsd in annotated_visual_spec_documents:
                    vsd.visual_spec_document.download_url = VisualSpecDocumentSerializer.get_download_url(self.request, vsd.visual_spec_document)
                    vsd.visual_spec_document.hires_url = VisualSpecDocumentSerializer.get_hires_url(self.request, vsd.visual_spec_document)
                    vsd.visual_spec_document.medium_res_url = VisualSpecDocumentSerializer.get_medium_res_url(self.request, vsd.visual_spec_document)
                    vsd.visual_spec_document.preview_url = VisualSpecDocumentSerializer.get_preview_url(self.request, vsd.visual_spec_document)
                s = AnnotatedVisualSpecDocumentSerializer(annotated_visual_spec_documents, many=True)
                annotated_visual_spec_documents_data = s.data
                context['items'] = annotated_visual_spec_documents_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _enrich_qs(self, qs):
        qs = qs.prefetch_related('annotations')
        return qs

    def update(self, request, pk):
        raise Exception("Need an update otherwise delete isn't detected by django-rest-framework")
    
    def delete(self, request, pk):
        try:
            annotated_visual_spec_document_id = pk
            annotated_visual_spec_document = self.allowed_annotated_visual_spec_documents().get(pk=annotated_visual_spec_document_id)
            doc = annotated_visual_spec_document.visual_spec_document
            vs_features = [x for x in annotated_visual_spec_document.visual_spec_features.all()]
            vs_issues = [y for y in annotated_visual_spec_document.visual_spec_issues.all()]
            annotated_visual_spec_document.delete()
            for vs_feature in vs_features:
                FeatureHistory.add_history(request.user, vs_feature.feature, "removing attachment", doc.name, "")
                vs_feature.feature.save()

            for vs_issue in vs_issues:
                IssueHistory.add_history(request.user, vs_issue.issue, "removing attachment", doc.name, "")
                vs_issue.issue.save()
            data = {'status': 'success'}
        
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
    
