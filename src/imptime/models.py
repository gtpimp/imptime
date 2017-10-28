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
    hires = HiResImageField(upload_to=upload_to_visual_spec_documents)
    lores = LoResImageField(upload_to=upload_to_visual_spec_documents)
    thumbnail = ThumbnailImageField(upload_to=upload_to_visual_spec_documents)

    hires_width = models.IntegerField()
    hires_height = models.IntegerField()
    
    name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=255, null=True)
    issue = ProtectedForeignKey(Issue, related_name='visual_spec_documents')
    order = models.IntegerField(default=1)

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(VisualSpecDocument, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    def move_after(self, other_visual_spec_document):
        self.order = other_visual_spec_document.order + 1
        self.save()
        self.renumber_visual_spec_document_order()

    def renumber_visual_spec_document_order(self):
        """ Doesn't re-sort, just makes the numbers sequential """
        order = 0
        for vsd in self.issue.visual_spec_documents\
                               .all().order_by("order", "id"):
            old_order = vsd.order
            if old_order != order:
                vsd.order = order
                vsd.save()
            order += 10

class VisualSpecIssue(BaseModel):

    SHAPES = [ ('circle', 'Circle'),
               ('pointer', 'Pointer') ]
    
    visual_spec_document = ProtectedForeignKey(VisualSpecDocument, related_name='visual_spec_issues')
    issue = ProtectedForeignKey(Issue, related_name='visual_spec_issues')
    shape = models.CharField(max_length=50, choices=SHAPES, default='circle')
    x_pos = models.FloatField()
    y_pos = models.FloatField()

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(VisualSpecIssue, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)
    
