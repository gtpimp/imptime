import logging
from .base_serializer import BaseSerializer
from rest_framework import serializers
logger = logging.getLogger(__name__)
from .visual_spec_document_serializer import VisualSpecDocumentSerializer
from .visual_spec_annotation_serializer import VisualSpecAnnotationSerializer

class AnnotatedVisualSpecDocumentSerializer(BaseSerializer):
    id = serializers.CharField(source="pk")
    visual_spec_document = VisualSpecDocumentSerializer()
    annotations = serializers.ListField(child=VisualSpecAnnotationSerializer(), source='fetched_annotations')

    def to_representation(self, obj, *args, **kwargs):
        obj.fetched_annotations = obj.annotations.all()
        return super(AnnotatedVisualSpecDocumentSerializer, self).to_representation(obj, *args, **kwargs)

    
