from lib.models import BaseModel
from lib.fields import UploadTo, ProtectedForeignKey
from timepiece.models import Issue
from django.db import models
import logging
logger = logging.getLogger(__name__)

upload_to_visual_spec_documents = UploadTo("visual_spec_documents")


class VisualSpecDocument(BaseModel):
    document = models.FileField(max_length=255, upload_to=upload_to_visual_spec_documents, null=False, blank=False)
    name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=255, null=True)
    issue = ProtectedForeignKey(Issue, related_name='visual_spec_documents')

class VisualIssue(BaseModel):

    SHAPES = [ ('circle', 'Circle') ]
    
    visual_spec_document = ProtectedForeignKey(VisualSpecDocument, related_name='visual_spec_documents')
    issue = ProtectedForeignKey(Issue, related_name='visual_issues')
    order = models.IntegerField(default=1)
    shape = models.CharField(max_length=50, choices=SHAPES, default='circle')
    x_pos = models.IntegerField()
    y_pos = models.IntegerField()
