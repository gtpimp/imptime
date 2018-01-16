from lib.models import BaseModel
from lib.fields import UploadTo, ProtectedForeignKey
from lib.fields import HiResImageField, LoResImageField, ThumbnailImageField
import hashlib
from django.contrib.auth.models import User
import PIL
from timepiece.models import Issue
from django.core.files import File as DjangoFile
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import IssueHistory
from impasync.refresh_notifier import RefreshNotifier
from django.db import models
from django.db.models import Max
import logging
logger = logging.getLogger(__name__)

upload_to_visual_spec_documents = UploadTo("visual_spec_documents")

class VisualSpecDocument(BaseModel):
    original_doc = models.FileField(max_length=255, upload_to=upload_to_visual_spec_documents)
    hires = HiResImageField(upload_to=upload_to_visual_spec_documents)
    lores = LoResImageField(upload_to=upload_to_visual_spec_documents)
    thumbnail = ThumbnailImageField(upload_to=upload_to_visual_spec_documents)
    hires_width = models.IntegerField()
    hires_height = models.IntegerField()
    md5sum = models.CharField(max_length=255)

    is_image = models.BooleanField(default=True)
    name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=255, null=True)

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(VisualSpecDocument, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    @classmethod
    def get_md5sum(self, f):
        hash_md5 = hashlib.md5()
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
        f.seek(0)
        return hash_md5.hexdigest()

    @classmethod
    def create_for_doc(self, user, project, doc, name, content_type, issue=None):
        is_image = content_type.startswith('image')
        if is_image:
            f_image = doc
        else:
            f_image = DjangoFile(open(os.path.join(os.path.dirname(os.path.realpath(__file__)), "unknown_visual_spec_doc_image.png")))
        width, height = PIL.Image.open(f_image).size

        md5sum = self.get_md5sum(f_image)

        vsd = VisualSpecDocument.objects.filter(md5sum=md5sum).first()
        if vsd is None:
            vsd = VisualSpecDocument.objects.create(original_doc=doc,
                                                    hires=f_image,
                                                    lores=f_image,
                                                    hires_width=width,
                                                    hires_height=height,
                                                    thumbnail=f_image,
                                                    name=name,
                                                    md5sum=md5sum,
                                                    content_type=content_type,
                                                    is_image=is_image)
        VisualSpecProject.objects.get_or_create(visual_spec_document=vsd,
                                                project_id=project.id,
                                                defaults={'order':VisualSpecProject.get_next_order(project.id)})
        project.save()
        if issue is not None:
            _, created = VisualSpecIssue.objects.get_or_create(visual_spec_document=vsd,
                                                               issue=issue,
                                                               defaults={'order':VisualSpecIssue.get_next_order(issue.id)})
            if created:
                issue.save()
                IssueHistory.add_history(user, issue, "added visual spec document", "", name)

    def height_and_width(self):
        height = self.hires_height
        width = self.hires_width
        if height > 500 or width > 500:
            if height > width:
                height = 500
                width = float(width) / 100 * (float(height) / self.hires_height * 100)
            else:
                width = 500
                height = float(height) / 100 * (float(width) / self.hires_width * 100)

        return height, width

    def height(self):
        height, width = self.height_and_width()
        return height

    def width(self):
        height, width = self.height_and_width()
        return width


class VisualSpecProject(BaseModel):
    visual_spec_document = ProtectedForeignKey(VisualSpecDocument, related_name='visual_spec_projects')
    project = ProtectedForeignKey(Project, related_name='visual_spec_projects')
    order = models.IntegerField(default=1)

    INCREMENT=10
    MAX_ORDER=999999

    class Meta:
        unique_together = ('project', 'visual_spec_document')

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(VisualSpecProject, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    @classmethod
    def renumber(self, project_id):
        vsps = self.objects.filter(project_id=project_id).order_by("order")
        order = 0
        for vsp in vsps:
            if vsp.order != order:
                vsp.order = order
                vsp.save()
            order += self.INCREMENT

    @classmethod
    def insert_after(self, project_id, visual_spec_document, set_after_this_visual_spec_document):
        self.renumber(project_id)
        vsp_target = self.objects.get_or_create(project_id=project_id,
                                                visual_spec_document_id=set_after_this_visual_spec_document.id,
                                                defaults={'order':self.MAX_ORDER})[0]
        new_order = vsp_target.order+1
        vsp, is_new = self.objects.get_or_create(project_id=project_id,
                                                 visual_spec_document_id=visual_spec_document.id,
                                                 defaults={'order':new_order})
        if not is_new:
            vsp.order = new_order
            vsp.save()
        self.renumber(project_id)

    @classmethod
    def insert_at_the_end(self, project_id, visual_spec_document_id):
        new_order = self.get_next_order(project_id)
        self.objects.get_or_create(project_id=project_id,
                                   visual_spec_document_id=visual_spec_document_id,
                                   defaults={'order':new_order})
        self.renumber(project_id)

    @classmethod
    def get_next_order(self, project_id):
        self.renumber(project_id)
        max_order = self.objects.filter(project_id=project_id)\
                                .aggregate(max_order=Max('order'))['max_order'] or 0
        return max_order + self.INCREMENT


class VisualSpecIssue(BaseModel):
    visual_spec_document = ProtectedForeignKey(VisualSpecDocument, related_name='visual_spec_issues')
    issue = ProtectedForeignKey(Issue, related_name='visual_spec_issues')
    order = models.IntegerField(default=1)

    INCREMENT=10
    MAX_ORDER=999999

    class Meta:
        unique_together = ('issue', 'visual_spec_document')

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(VisualSpecIssue, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    @classmethod
    def renumber(self, issue_id):
        vsis = self.objects.filter(issue_id=issue_id).order_by("order")
        order = 0
        for vsi in vsis:
            if vsi.order != order:
                vsi.order = order
                vsi.save()
            order += self.INCREMENT

    @classmethod
    def insert_after(self, issue_id, visual_spec_document, set_after_this_visual_spec_document):
        self.renumber(issue_id)
        vsi_target = self.objects.get_or_create(issue_id=issue_id,
                                                visual_spec_document_id=set_after_this_visual_spec_document.id,
                                                defaults={'order':self.MAX_ORDER})[0]
        new_order = vsi_target.order+1
        vsi, is_new = self.objects.get_or_create(issue_id=issue_id,
                                                 visual_spec_document_id=visual_spec_document.id,
                                                 defaults={'order':new_order})
        if not is_new:
            vsi.order = new_order
            vsi.save()
        self.renumber(issue_id)

    @classmethod
    def insert_at_the_end(self, issue_id, visual_spec_document_id):
        new_order = self.get_next_order(issue_id)
        self.objects.get_or_create(issue_id=issue_id,
                                   visual_spec_document_id=visual_spec_document_id,
                                   defaults={'order':new_order})
        self.renumber(issue_id)

    @classmethod
    def get_next_order(self, issue_id):
        self.renumber(issue_id)
        max_order = self.objects.filter(issue_id=issue_id)\
                                .aggregate(max_order=Max('order'))['max_order'] or 0
        return max_order + self.INCREMENT


class VisualSpecIssueAnnotation(BaseModel):

    SHAPES = [ ('circle', 'Circle'),
               ('square', 'Square'),
               ('arrow', 'Arrow') ]

    TARGET_OFFSET_PERCENTAGES = { 'circle': { 'x': 50, 'y': 50 },
                                  'square': { 'x': 50, 'y': 50 },
                                  'arrow': { 'x': 100, 'y': 50 } }

    visual_spec_issue = models.ForeignKey(VisualSpecIssue, related_name='visual_spec_issue_annotations')
    shape = models.CharField(max_length=50, choices=SHAPES, default='circle')
    x_pos = models.FloatField()
    y_pos = models.FloatField()
    x_offset_to_target = models.FloatField()
    y_offset_to_target = models.FloatField()

    def save(self, *args, **kwargs):
        was_created = not self.id
        self.x_offset_to_target = self.TARGET_OFFSET_PERCENTAGES[self.shape]['x']
        self.y_offset_to_target = self.TARGET_OFFSET_PERCENTAGES[self.shape]['y']
        super(VisualSpecIssueAnnotation, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    def shape_url(self):
        return 'images/visual_spec_issue__%s.png' % self.shape

class SprintTemplate(BaseModel):
    sprint = ProtectedForeignKey(Sprint, related_name='templates', null=False)
    clones = models.ManyToManyField(Sprint, related_name='parent_sprint_templates')

class ReleaseNote(BaseModel):
    header = models.TextField(null=False)
    content = models.TextField(null=False)

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(ReleaseNote, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    def delete(self):
        super(ReleaseNote, self).delete()
        RefreshNotifier().notify_model_delete(self)


class ReleaseNoteSeen(BaseModel):
    release_note = ProtectedForeignKey(ReleaseNote, related_name='seen_by', null=False)
    seen_by = models.ForeignKey(User, related_name='release_notes_seen_by', null=False, blank=False)
    seen_at = models.DateTimeField(null=False, auto_now=True)

class Nudge(BaseModel):

    user = models.ForeignKey(User, related_name='nudges', null=False, blank=False)
    sprint = models.ForeignKey(Sprint, related_name='nudges', null=False)
    issue = models.ForeignKey(Issue, related_name='nudges', null=True)
    reason = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    due_date = models.DateTimeField(null=True)
    due_date_reason = models.CharField(max_length=255, null=True)

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(Nudge, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    def delete(self, *args, **kwargs):
        super(Nudge, self).delete(*args, **kwargs)
        RefreshNotifier().notify_model_delete(self)
