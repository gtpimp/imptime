import logging
from visual_spec_feature_serializer import VisualSpecFeatureSerializer
from django_downloadview import HTTPDownloadView
from django.contrib.auth.decorators import login_required
from visual_spec_feature_annotation_serializer import VisualSpecFeatureAnnotationSerializer
from visual_spec_feature_annotation_serializer import VisualSpecFeatureAnnotationInboundSerializer
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
from imptime.models import Feature
from imptime.models import VisualSpecFeatureAnnotation, VisualSpecFeature

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class VisualSpecFeatureAnnotationViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            visual_spec_feature_annotations = self.allowed_visual_spec_feature_annotations()
            visual_spec_feature_annotations = self.apply_filter(qs=visual_spec_feature_annotations,
                                                              raw_filter_args=filter_args)
            visual_spec_feature_annotations = self.apply_pagination(qs=visual_spec_feature_annotations,
                                                                  pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in visual_spec_feature_annotations.values_list(
                    'id', flat=True)]
            else:
                s = VisualSpecFeatureAnnotationSerializer(visual_spec_feature_annotations, many=True)
                visual_spec_feature_annotations_data = s.data
                context['visual_spec_feature_annotations'] = visual_spec_feature_annotations_data
                
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
            feature_id = params['feature_id']
            feature = self.allowed_features().get(pk=feature_id)
            visual_spec_feature = VisualSpecFeature.objects.get(feature_id=feature_id,
                                                            visual_spec_document_id=visual_spec_document_id)
            s = VisualSpecFeatureAnnotationInboundSerializer(data=params)
            if s.is_valid():
                annotation = s.save(visual_spec_feature=visual_spec_feature)
                feature.save()
            else:
                return self.error_response(Exception("Invalid post data: %s" % s.errors))
            
            data = {'status': 'success',
                    'payload': {'item':VisualSpecFeatureAnnotationSerializer(instance=annotation).data}}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            visual_spec_feature_annotation_ids = params.get('visual_spec_feature_annotation_ids', [pk])
            self.allowed_feature(params['value']['feature_id'])
            self.allowed_visual_spec_documents().get(pk=params['value']['visual_spec_document_id'])
            items = []
            for vsia_id in visual_spec_feature_annotation_ids:
                visual_spec_feature_annotation = self.allowed_visual_spec_feature_annotations().get(pk=vsia_id)
                s = VisualSpecFeatureAnnotationInboundSerializer(instance=visual_spec_feature_annotation, data=params['value'])
                if s.is_valid():
                    s.save()
                items.append(visual_spec_feature_annotation)

            s = VisualSpecFeatureAnnotationSerializer(items, many=True)
            context = {'items': s.data}
            data = {'status': 'success',
                    'payload': context}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))
    
    def delete(self, request, pk):
        try:
            visual_spec_feature_annotation_id = pk
            visual_spec_feature_annotation = self.allowed_visual_spec_feature_annotations().get(pk=visual_spec_feature_annotation_id)
            feature = visual_spec_feature_annotation.visual_spec_feature.feature
            visual_spec_feature_annotation.delete()
            feature.save()
            data = {'status': 'success'}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
