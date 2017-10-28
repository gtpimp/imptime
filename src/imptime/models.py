from lib.models import BaseModel
from lib.fields import UploadTo, ProtectedForeignKey
from lib.fields import HiResImageField, LoResImageField, ThumbnailImageField
from timepiece.models import Issue
from impasync.refresh_notifier import RefreshNotifier
from django.db import models
import logging
logger = logging.getLogger(__name__)

upload_to_visual_spec_documents = UploadTo("visual_spec_documents")


class VisualSpecDocument(BaseModel):
    document = models.FileField(max_length=255, upload_to=upload_to_visual_spec_documents, null=False, blank=False)
    hires = HiResImageField(upload_to=upload_to_visual_spec_documents, null=True)
    lores = LoResImageField(source='hires', null=True)
    thumbnail = ThumbnailImageField(source='hires', null=True)
    
    name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=255, null=True)
    issue = ProtectedForeignKey(Issue, related_name='visual_spec_documents')

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(VisualSpecDocument, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)


class VisualSpecIssue(BaseModel):

    SHAPES = [ ('circle', 'Circle'),
               ('pointer', 'Pointer') ]
    
    visual_spec_document = ProtectedForeignKey(VisualSpecDocument, related_name='visual_spec_issues')
    issue = ProtectedForeignKey(Issue, related_name='visual_spec_issues')
    order = models.IntegerField(default=1)
    shape = models.CharField(max_length=50, choices=SHAPES, default='circle')
    x_pos = models.IntegerField()
    y_pos = models.IntegerField()

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(VisualSpecIssue, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)
    
