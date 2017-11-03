from lib.models import BaseModel
from lib.fields import UploadTo, ProtectedForeignKey
from lib.fields import HiResImageField, LoResImageField, ThumbnailImageField
from django.contrib.auth.models import User
from timepiece.models import Issue
from timepiece.models import Project as Sprint
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
        at_least_one_changed = False
        for vsd in self.issue.visual_spec_documents\
                               .all().order_by("order", "id"):
            old_order = vsd.order
            if old_order != order:
                vsd.order = order
                vsd.save()
                at_least_one_changed = True
            order += 10
        if at_least_one_changed:
            self.issue.save() # force invalidation

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
    
class SprintTemplate(BaseModel):
    sprint = ProtectedForeignKey(Sprint, related_name='templates', null=False)
    clones = models.ManyToManyField(Sprint, related_name='parent_sprint_templates')

class ReleaseNote(BaseModel):
    header = models.TextField(null=False)
    content = models.TextField(null=False)
    created_by = models.ForeignKey(User, related_name='release_notes_created_by', null=False, blank=False)

class ReleaseNoteSeen(BaseModel):
    release_note = ProtectedForeignKey(ReleaseNote, related_name='seen_by', null=False)
    seen_by = models.ForeignKey(User, related_name='release_notes_seen_by', null=False, blank=False)
    seen_at = models.DateTimeField(null=False, auto_now=True)
