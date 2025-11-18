import logging
from django_downloadview import HTTPDownloadView
from django.contrib.auth.decorators import login_required
from visual_spec_annotation_serializer import VisualSpecAnnotationSerializer
from visual_spec_annotation_serializer import VisualSpecAnnotationInboundSerializer
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
from imptime.models import VisualSpecAnnotation, AnnotatedVisualSpecDocument

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class VisualSpecAnnotationViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            visual_spec_annotations = self.allowed_visual_spec_annotations()
            visual_spec_annotations = self.apply_filter(qs=visual_spec_annotations,
                                                        raw_filter_args=filter_args)
            visual_spec_annotations = self.apply_pagination(qs=visual_spec_annotations,
                                                            pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in visual_spec_annotations.values_list(
                    'id', flat=True)]
            else:
                s = VisualSpecAnnotationSerializer(visual_spec_annotations, many=True)
                visual_spec_annotations_data = s.data
                context['visual_spec_annotations'] = visual_spec_annotations_data
                
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
    
    def create(self, request):
        try:
            params = request.data['item']
            annotated_visual_spec_document_id = params['annotated_visual_spec_document_id']
            annotated_visual_spec_document = self.allowed_annotated_visual_spec_documents().get(pk=annotated_visual_spec_document_id)
            s = VisualSpecAnnotationInboundSerializer(data=params)
            if s.is_valid():
                annotation = s.save(annotated_visual_spec_document=annotated_visual_spec_document)
                annotation.save()
            else:
                return self.error_response(Exception("Invalid post data: %s" % s.errors))
            
            data = {'status': 'success',
                    'payload': {'item':VisualSpecAnnotationSerializer(instance=annotation).data}}
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            visual_spec_annotation_ids = params.get('visual_spec_annotation_ids', [pk])
            self.allowed_annotated_visual_spec_documents().get(pk=params['value']['annotated_visual_spec_document_id'])
            items = []
            for vsia_id in visual_spec_annotation_ids:
                visual_spec_annotation = self.allowed_visual_spec_annotations().get(pk=vsia_id)
                s = VisualSpecAnnotationInboundSerializer(instance=visual_spec_annotation, data=params['value'])
                if s.is_valid():
                    s.save()
                items.append(visual_spec_annotation)

            s = VisualSpecAnnotationSerializer(items, many=True)
            context = {'items': s.data}
            data = {'status': 'success',
                    'payload': context}
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))
    
    def delete(self, request, pk):
        try:
            visual_spec_annotation_id = pk
            visual_spec_annotation = self.allowed_visual_spec_annotations().get(pk=visual_spec_annotation_id)
            visual_spec_annotation.delete()
            data = {'status': 'success'}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
