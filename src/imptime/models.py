from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Case, When, SET_NULL
from django.db.models.query import QuerySet
from lib.json_helper import json_dump
from django.db import models
from django.db.models import Max
from impasync.refresh_notifier import RefreshNotifier
from lib.fields import HiResImageField, ThumbnailImageField
from lib.fields import UploadTo, ProtectedForeignKey
from lib.models import BaseModel
from timepiece.models import Business as Project
from timepiece.models import Issue
from timepiece.models import ProjectIssueOrder as SprintIssueOrder
from timepiece.models import IssueHistory
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions as ProjectPermissions
from testable.models import Testable
from multiple_issue_summary_calculator import MultipleIssueSummaryCalculator
from project_statement_calculator import ProjectStatementCalculator
from time_summary_calculator import TimeSummaryCalculator
from estimate_summary_calculator import EstimateSummaryCalculator
import PIL
import hashlib
import logging
logger = logging.getLogger(__name__)

upload_to_visual_spec_documents = UploadTo("visual_spec_documents")

class VisualSpecDocument(BaseModel):
    original_doc = models.FileField(max_length=255, upload_to=upload_to_visual_spec_documents)
    hires = HiResImageField(upload_to=upload_to_visual_spec_documents)
    thumbnail = ThumbnailImageField(upload_to=upload_to_visual_spec_documents, null=True)
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
    def create_for_doc(self, user, project, doc, name, content_type, issue=None, feature=None, wiki=None):
        d_file = doc
        is_image = content_type.startswith('image')
        if is_image:
            f_image = doc
            width, height = PIL.Image.open(f_image).size
        else:
            f_image = None
            width, height = 0, 0

        md5sum = self.get_md5sum(d_file)
        vsd = VisualSpecDocument.objects.filter(md5sum=md5sum).first()

        if vsd is None:
            vsd = VisualSpecDocument.objects.create(original_doc=d_file,
                                                    hires=f_image,
                                                    hires_width=width,
                                                    hires_height=height,
                                                    thumbnail=f_image,
                                                    name=name,
                                                    md5sum=md5sum,
                                                    content_type=content_type,
                                                    is_image=is_image)

        annotated_vsd = AnnotatedVisualSpecDocument.objects.create(visual_spec_document=vsd)
            
        VisualSpecProject.objects.get_or_create(visual_spec_document=vsd,
                                                project_id=project.id,
                                                defaults={'order':VisualSpecProject.get_next_order(project.id)})
        project.save()
        
        if issue is not None:
            _, created = VisualSpecIssue.objects.get_or_create(annotated_visual_spec_document=annotated_vsd,
                                                               issue=issue,
                                                               defaults={'order':VisualSpecIssue.get_next_order(issue.id)})
            if created:
                issue.save()
                IssueHistory.add_history(user, issue, "added attachment", "", name)

        if feature is not None:
            _, created = VisualSpecFeature.objects.get_or_create(annotated_visual_spec_document=annotated_vsd,
                                                                 feature=feature,
                                                                 defaults={'order':VisualSpecFeature.get_next_order(feature.id)})
            if created:
                feature.save()
                FeatureHistory.add_history(user, feature, "added attachment", "", name)

        if wiki is not None:
            _, created = VisualSpecWiki.objects.get_or_create(annotated_visual_spec_document=annotated_vsd,
                                                              wiki=wiki,
                                                              defaults={'order':VisualSpecWiki.get_next_order(wiki.id)})
            if created:
                wiki.save()
                WikiPageHistory.add_history(user, wiki, "added attachment", "", name)
                
                
    def height_and_width(self):
        max_size = settings.QUOTE_IMAGE_MAX_SIZE
        height = self.hires_height
        width = self.hires_width
        if height > max_size or width > max_size:
            if height > width:
                height = max_size
                width = float(width) / 100 * (float(height) / self.hires_height * 100)
            else:
                width = max_size
                height = float(height) / 100 * (float(width) / self.hires_width * 100)

        return height, width

    def height(self):
        height, width = self.height_and_width()
        return height

    def width(self):
        height, width = self.height_and_width()
        return width

class AnnotatedVisualSpecDocument(BaseModel):
    visual_spec_document = ProtectedForeignKey(VisualSpecDocument, related_name='annotated_visual_spec_document')

    @classmethod
    def clone(self, annotated_visual_spec_document):
        clone = annotated_visual_spec_document
        annotations = annotated_visual_spec_document.annotations.all()
        clone.id = None
        clone.save()
        for annotation in annotations:
            annotation.id = None
            annotation.annotated_visual_spec_document = clone
            annotation.save()
        return clone
    
class VisualSpecAnnotation(BaseModel):

    SHAPES = [ ('circle', 'Circle'),
               ('square', 'Square'),
               ('arrow', 'Arrow') ]

    TARGET_OFFSET_PERCENTAGES = { 'circle': { 'x': 50, 'y': 50 },
                                  'square': { 'x': 50, 'y': 50 },
                                  'arrow': { 'x': 100, 'y': 50 } }

    annotated_visual_spec_document = models.ForeignKey(AnnotatedVisualSpecDocument, related_name='annotations')
    shape = models.CharField(max_length=50, choices=SHAPES, default='circle')
    x_pos = models.FloatField()
    y_pos = models.FloatField()
    x_offset_to_target = models.FloatField()
    y_offset_to_target = models.FloatField()

    def save(self, *args, **kwargs):
        was_created = not self.id
        self.x_offset_to_target = self.TARGET_OFFSET_PERCENTAGES[self.shape]['x']
        self.y_offset_to_target = self.TARGET_OFFSET_PERCENTAGES[self.shape]['y']
        super(VisualSpecAnnotation, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self, params={'annotated_visual_spec_document_id':str(self.annotated_visual_spec_document_id)})
        else:
            RefreshNotifier().notify_model_update(self, params={'annotated_visual_spec_document_id':str(self.annotated_visual_spec_document_id)})

    def delete(self):
        super(VisualSpecAnnotation, self).delete()
        RefreshNotifier().notify_model_delete(self, params={'annotated_visual_spec_document_id':str(self.annotated_visual_spec_document_id)})
            
    def shape_url(self):
        return 'images/visual_spec__%s.png' % self.shape


class VisualSpecProject(BaseModel):
    visual_spec_document = ProtectedForeignKey(VisualSpecDocument, related_name='visual_spec_projects')
    project = ProtectedForeignKey(Project, related_name='visual_spec_projects')
    order = models.IntegerField(default=1)

    INCREMENT = 10
    MAX_ORDER = 999999

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
    deprecated_visual_spec_document = ProtectedForeignKey(VisualSpecDocument, related_name='visual_spec_issues', null=True)
    annotated_visual_spec_document = models.ForeignKey(AnnotatedVisualSpecDocument, related_name='visual_spec_issues')
    issue = ProtectedForeignKey(Issue, related_name='visual_spec_issues')
    order = models.IntegerField(default=1)

    INCREMENT=10
    MAX_ORDER=999999

    class Meta:
        unique_together = ('issue', 'annotated_visual_spec_document')

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


class VisualSpecFeature(BaseModel):
    deprecated_visual_spec_document = ProtectedForeignKey(VisualSpecDocument, related_name='visual_spec_features', null=True)
    annotated_visual_spec_document = models.ForeignKey(AnnotatedVisualSpecDocument, related_name='visual_spec_features')
    feature = ProtectedForeignKey("imptime.Feature", related_name='visual_spec_features')
    order = models.IntegerField(default=1)

    INCREMENT=10
    MAX_ORDER=999999

    class Meta:
        unique_together = ('feature', 'annotated_visual_spec_document')

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(VisualSpecFeature, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    @classmethod
    def renumber(self, feature_id):
        vsis = self.objects.filter(feature_id=feature_id).order_by("order")
        order = 0
        for vsi in vsis:
            if vsi.order != order:
                vsi.order = order
                vsi.save()
            order += self.INCREMENT

    @classmethod
    def insert_after(self, feature_id, visual_spec_document, set_after_this_visual_spec_document):
        self.renumber(feature_id)
        vsi_target = self.objects.get_or_create(feature_id=feature_id,
                                                visual_spec_document_id=set_after_this_visual_spec_document.id,
                                                defaults={'order':self.MAX_ORDER})[0]
        new_order = vsi_target.order+1
        vsi, is_new = self.objects.get_or_create(feature_id=feature_id,
                                                 visual_spec_document_id=visual_spec_document.id,
                                                 defaults={'order':new_order})
        if not is_new:
            vsi.order = new_order
            vsi.save()
        self.renumber(feature_id)

    @classmethod
    def insert_at_the_end(self, feature_id, visual_spec_document_id):
        new_order = self.get_next_order(feature_id)
        self.objects.get_or_create(feature_id=feature_id,
                                   visual_spec_document_id=visual_spec_document_id,
                                   defaults={'order':new_order})
        self.renumber(feature_id)

    @classmethod
    def get_next_order(self, feature_id):
        self.renumber(feature_id)
        max_order = self.objects.filter(feature_id=feature_id)\
                                .aggregate(max_order=Max('order'))['max_order'] or 0
        return max_order + self.INCREMENT
    

class SprintTemplate(BaseModel):
    sprint = ProtectedForeignKey(Sprint, related_name='templates', null=False)
    clones = models.ManyToManyField(Sprint, related_name='parent_sprint_templates')

    
class WikiPage(BaseModel):
    money_sensitive = models.BooleanField(default=False) #true if refers to project commercials
    name = models.CharField(max_length=100, null=False, blank=False)
    project = ProtectedForeignKey(Project, related_name='wikis', null=False)
    content = models.TextField(null=True)
    enriched_content = models.TextField(null=True)
    store_encrypted = models.BooleanField(default=False) #true if refers to project commercials

    ENCRYPTED_TOKEN = "__ENCRYPTED__"

    def save(self, *args, **kwargs):
        was_created = not self.id

        
        if self.store_encrypted:
            has_content = self.content is not None and len(self.content.strip())>0
            if has_content and self.ENCRYPTED_TOKEN not in self.content:
                raise Exception("Content is not encrypted, not saving")
        
        super(WikiPage, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    def delete(self):
        super(WikiPage, self).delete()
        RefreshNotifier().notify_model_delete(self)

class WikiPageHistory(BaseModel):
    wiki_page_id = models.IntegerField(blank=False, null=False, db_index=True)
    original_wiki_page = models.ForeignKey(WikiPage, null=True, db_index=True, on_delete=SET_NULL, related_name="histories")
    created_by = models.ForeignKey(User, blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=False, null=False)
    before = models.TextField(blank=True, null=True)
    after = models.TextField(blank=True, null=True)
    
    @classmethod
    def add_history(self, user, wiki_page, description, before, after):
        WikiPageHistory.objects.create(created_by=user,
                                       original_wiki_page=wiki_page,
                                       wiki_page_id=wiki_page.id,
                                       description=description,
                                       before=before, after=after)

    @classmethod
    def for_wiki_page(self, wiki_page):
        return WikiPageHistory.objects.filter(wiki_page_id=wiki_page.id).order_by("-created_at")

        
class VisualSpecWiki(BaseModel):
    deprecated_visual_spec_document = ProtectedForeignKey(VisualSpecDocument, related_name='visual_spec_wikis', null=True)
    annotated_visual_spec_document = models.ForeignKey(AnnotatedVisualSpecDocument, related_name='visual_spec_wikis')
    wiki = ProtectedForeignKey("imptime.WikiPage", related_name='visual_spec_wikis')
    order = models.IntegerField(default=1)

    INCREMENT=10
    MAX_ORDER=999999

    class Meta:
        unique_together = ('wiki', 'annotated_visual_spec_document')

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(VisualSpecWiki, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    @classmethod
    def renumber(self, wiki_id):
        vsis = self.objects.filter(wiki_id=wiki_id).order_by("order")
        order = 0
        for vsi in vsis:
            if vsi.order != order:
                vsi.order = order
                vsi.save()
            order += self.INCREMENT

    @classmethod
    def insert_after(self, wiki_id, visual_spec_document, set_after_this_visual_spec_document):
        self.renumber(wiki_id)
        vsi_target = self.objects.get_or_create(wiki_id=wiki_id,
                                                visual_spec_document_id=set_after_this_visual_spec_document.id,
                                                defaults={'order':self.MAX_ORDER})[0]
        new_order = vsi_target.order+1
        vsi, is_new = self.objects.get_or_create(wiki_id=wiki_id,
                                                 visual_spec_document_id=visual_spec_document.id,
                                                 defaults={'order':new_order})
        if not is_new:
            vsi.order = new_order
            vsi.save()
        self.renumber(wiki_id)

    @classmethod
    def insert_at_the_end(self, wiki_id, visual_spec_document_id):
        new_order = self.get_next_order(wiki_id)
        self.objects.get_or_create(wiki_id=wiki_id,
                                   visual_spec_document_id=visual_spec_document_id,
                                   defaults={'order':new_order})
        self.renumber(wiki_id)

    @classmethod
    def get_next_order(self, wiki_id):
        self.renumber(wiki_id)
        max_order = self.objects.filter(wiki_id=wiki_id)\
                                .aggregate(max_order=Max('order'))['max_order'] or 0
        return max_order + self.INCREMENT


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

class NudgeQuerySet(QuerySet):
    def order_by_user_id(self, user_id, descending=False):
        if user_id:
            direction = ("-" if descending else "") + "order"
            nudge_ids_in_order = UserNudgeOrder.objects.filter(nudge__user_id=user_id)\
                                                       .order_by(direction)\
                                                       .values_list("nudge_id", flat=True)
            if nudge_ids_in_order.count() == 0:
                return self
            preserved = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(nudge_ids_in_order)])

            return self.order_by(preserved)
        else:
            return self
    
    
class Nudge(BaseModel):

    user = models.ForeignKey(User, related_name='nudges', null=False, blank=False)
    sprint = models.ForeignKey(Sprint, related_name='nudges', null=False)
    issue = models.ForeignKey(Issue, related_name='nudges', null=True)
    reason = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    due_date = models.DateTimeField(null=True)
    due_date_reason = models.CharField(max_length=255, null=True)
    estimated_start_at = models.DateTimeField(null=True)
    estimated_end_at = models.DateTimeField(null=True)
    estimated_hours = models.FloatField(null=True)

    objects = NudgeQuerySet().as_manager()
    
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

    def num_unnudged_issues_above(self):
        """ when adding a nudge manually, it's possible for there to be 
            un-nudged issues above this one in the nudge list. 
            This is not recommended, and this property helps to 
            warn about this case """

        if not self.is_manual:
            return 0

        try:
            issue_order = SprintIssueOrder.objects.get(project_id=self.sprint_id,
                                                        issue_id=self.issue_id)\
                                                  .order
        except SprintIssueOrder.DoesNotExist:
            return 0
        issues_above = Issue.objects.filter(project_id=self.sprint_id,
                                            assigned_to_id=self.user_id,
                                            nudges__isnull=True,
                                            project_issue_orders__order__lt=issue_order)\
                                    .filter_open(self.user_id)
        return issues_above.count()
        
    @property
    def is_manual(self):
        return self.reason == "manual"
        
class UserNudgeOrder(BaseModel):
    order = models.FloatField()
    nudge = models.ForeignKey(Nudge, related_name='nudge_orders', null=False, blank=False, unique=True)

    INCREMENT=10
    MAX_ORDER=999999

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(UserNudgeOrder, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    @classmethod
    def renumber(self, user_id):
        nudge_ids = Nudge.objects.filter(user_id=user_id).order_by_user_id(user_id).values_list('pk', flat=True)
        order = 0
        for nudge_id in nudge_ids:
            uno = UserNudgeOrder.objects.get_or_create(nudge_id=nudge_id,
                                                       defaults={'order':order})[0]
            if uno.order != order:
                uno.order = order
                uno.save()
            order += self.INCREMENT

    @classmethod
    def insert_before(self, nudge, set_before_this_nudge):
        if nudge.user_id != set_before_this_nudge.user_id:
            raise Exception("Cannot reorder, must be for the same user")
        self.renumber(nudge.user_id)
        uno = self.objects.get_or_create(nudge_id=set_before_this_nudge.id,
                                         defaults={'order':self.MAX_ORDER})[0]
        new_order = uno.order-1
        uno, is_new = self.objects.get_or_create(nudge_id=nudge.id)
        if not is_new:
            uno.order = new_order
            uno.save()
        self.renumber(nudge.user_id)

    @classmethod
    def insert_after(self, nudge, set_after_this_nudge):
        if nudge.user_id != set_after_this_nudge.user_id:
            raise Exception("Cannot reorder, must be for the same user")
        self.renumber(nudge.user_id)
        uno_target = self.objects.get_or_create(nudge_id=set_after_this_nudge.id,
                                                defaults={'order':self.MAX_ORDER})[0]
        new_order = uno_target.order+1
        uno, is_new = self.objects.get_or_create(nudge_id=nudge.id,
                                                 defaults={'order':new_order})
        if not is_new:
            uno.order = new_order
            uno.save()
        self.renumber(nudge.user_id)

    @classmethod
    def insert_at_the_beginning(self, nudge):
        new_order = -1
        uno, is_new = self.objects.get_or_create(nudge_id=nudge.id, defaults={'order':new_order})
        if not is_new:
            uno.order = new_order
            uno.save()
        self.renumber(nudge.user_id)

    @classmethod
    def insert_at_the_end(self, nudge):
        new_order = self.get_next_order(nudge.user_id)
        uno, is_new = self.objects.get_or_create(nudge_id=nudge.id, defaults={'order':new_order})
        if not is_new:
            uno.order = new_order
            uno.save()
        self.renumber(nudge.user_id)

    @classmethod
    def order_like_this(self, user_id, ordered_nudge_ids):
        order = 0
        for nudge_id in ordered_nudge_ids:
            uno = UserNudgeOrder.objects.get_or_create(nudge_id=nudge_id,
                                                       defaults={'order':order})[0]
            if uno.order != order:
                uno.order = order
                uno.save()
            order += self.INCREMENT

    @classmethod
    def sort_these_nudge_ids(self, user_id, unordered_nudge_ids):
        return UserNudgeOrder.objects.filter(nudge__user_id=user_id)\
                                     .filter(nudge_id__in=unordered_nudge_ids)\
                                     .order_by("order")\
                                     .values_list("nudge_id", flat=True)

    @classmethod
    def get_next_order(self, user_id, nudge_qs=None):
        self.renumber(user_id)
        if nudge_qs is None:
            nudge_qs = Nudge.objects.filter(user_id=user_id)
        max_order = self.objects.filter(nudge__in=nudge_qs)\
                                .aggregate(max_order=Max('order'))['max_order'] or 0
        return max_order + self.INCREMENT
    
        
class Mien(BaseModel):
    user = models.ForeignKey(User, related_name='miens', null=False, blank=False)
    title = models.CharField(max_length=255, null=True, blank=True)
    order = models.IntegerField(default=0)
    issue_headers = models.TextField(null=True, blank=True) #json blob
    nudge_headers = models.TextField(null=True, blank=True) #json blob
    features = models.TextField(null=True, blank=True) #json blob

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(Mien, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    def delete(self, *args, **kwargs):
        super(Mien, self).delete(*args, **kwargs)
        RefreshNotifier().notify_model_delete(self)

    @classmethod
    def create_default_mien(self, user):
        return self.objects.get_or_create(user=user, title='Default view')

class MienHeader(BaseModel):
    mien = models.ForeignKey(Mien, related_name='headers', null=False, blank=False)
    name = models.CharField(max_length=50, null=False, blank=False)
    headers = models.TextField(null=True, blank=True) #json blob

    class Meta:
        unique_together = ('mien', 'name')

    
class CompanyProblem(BaseModel):

    PROBLEM_TYPE_OPTIONS = [ ('missing_rate', 'Missing rate'),
                             ('missing_budget', 'Missing budget') ]
    PROBLEM_TYPE_STATUSES = [ ('open', 'Open'),
                              ('closed', 'Closed'),
                              ('cant_fix', "Can't fix") ]
    DELETABLE_STATUSES = ['open', 'closed']
    
    user = models.ForeignKey(User, related_name='company_problems', null=True, blank=True)
    project = models.ForeignKey(Project, related_name='company_problems', null=False)
    sprint = models.ForeignKey(Sprint, related_name='company_problems', null=False)
    description = models.TextField(null=True, blank=True)
    problem_type = models.CharField(max_length=100, null=False, choices=PROBLEM_TYPE_OPTIONS)
    money_sensitive = models.BooleanField(default=False) #true if refers to project commercials
    status = models.CharField(max_length=100, choices=PROBLEM_TYPE_STATUSES, default='open')
    
    def save(self, *args, **kwargs):
        was_created = not self.id
        super(CompanyProblem, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    def delete(self, *args, **kwargs):
        super(CompanyProblem, self).delete(*args, **kwargs)
        RefreshNotifier().notify_model_delete(self)

    
class Schedule(BaseModel):
    name = models.CharField(max_length=255, null=False, blank=False)
    owner = ProtectedForeignKey(User, related_name='owned_schedules', null=False, blank=False)
    viewers = models.ManyToManyField(User, related_name='viewable_schedules')
    editors = models.ManyToManyField(User, related_name='editable_schedules')
    default = models.BooleanField(default=True)

    class Meta:
        unique_together = ('name', 'owner')

    @classmethod
    def get_default_schedule_for_user(self, user):
        schedule = Schedule.objects.filter(owner=user, default=True).first()
        if schedule is None:
            schedule = Schedule.objects.get_or_create(owner=user,
                                                      default=True,
                                                      defaults={'name':"Planning schedule"})[0]
        return schedule
        
    def save(self, *args, **kwargs):
        was_created = not self.id
        super(Schedule, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)
        
    
class ScheduleItem(BaseModel):
    schedule = ProtectedForeignKey(Schedule, related_name='items', null=False, blank=False)
    order = models.IntegerField(default=0, null=False, db_index=True)
    project = ProtectedForeignKey(Project, related_name='schedules', null=True, blank=True)
    sprint = ProtectedForeignKey(Sprint, related_name='schedules', null=True, blank=True)
    issue = ProtectedForeignKey(Issue, related_name='schedules', null=True, blank=True)
    start_at = models.DateTimeField(null=True, db_index=True)
    end_at = models.DateTimeField(null=True, db_index=True)
    duration_hours = models.FloatField(null=True)

    def save(self, *args, **kwargs):
        was_created = not self.id

        if self.duration_hours is None:
            self.duration_hours = float((self.end_at - self.start_at).total_seconds())/3600
        
        super(ScheduleItem, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)
    
    def delete(self):
        super(ScheduleItem, self).delete()
        RefreshNotifier().notify_model_delete(self)

class SprintSnapshot(BaseModel):
    sprint = ProtectedForeignKey(Sprint, related_name='snapshots', null=False, blank=False)
    description = models.TextField(null=True)
    cost_summary = models.TextField(null=True)
    project_statement = models.TextField(null=True)
    time_summary = models.TextField(null=True)
    affected_entities = models.TextField(null=True)
    estimate_time_summary = models.TextField(null=True)

    @classmethod
    def create_snapshot(self, description, sprint_id, user):
        sprint = Sprint.objects.get(pk=sprint_id)
        cost_summary = self.calculate_cost_summary(sprint, user=user)
        project_statement = ProjectStatementCalculator().get_data(user=user,
                                                                  project_id=sprint.business_id) #sic
        time_summary = TimeSummaryCalculator().get_data(sprint_id=sprint.id, user=user)
        estimate_time_summary = EstimateSummaryCalculator().get_data(sprint_id=sprint.id, user=user)

        affected_entities = { 'all_user_ids': [],
                              'all_sprint_ids': [],
                              'all_tag_ids': [],
                              'all_issue_ids': [] }
        affected_entities['all_user_ids'].extend(time_summary['all_user_ids'])
        affected_entities['all_user_ids'].extend(cost_summary['breakdown']['all_user_ids'])
        affected_entities['all_user_ids'].extend(estimate_time_summary['all_user_ids'])
        affected_entities['all_tag_ids'].extend(cost_summary['breakdown']['all_tag_ids'])
        affected_entities['all_issue_ids'].extend(cost_summary['breakdown']['all_issue_ids'])
        affected_entities['all_sprint_ids'].extend(cost_summary['breakdown']['all_sprint_ids'])
        
        return SprintSnapshot.objects.create(description=description,
                                             sprint_id=sprint.id,
                                             cost_summary=json_dump(cost_summary),
                                             project_statement=json_dump(project_statement),
                                             time_summary=json_dump(time_summary),
                                             estimate_time_summary=json_dump(estimate_time_summary),
                                             affected_entities=json_dump(affected_entities))
    
    @classmethod
    def calculate_cost_summary(self, sprint, user):
        cost_summary = sprint.prepare_stats_for_json(user=user)
        issue_qs = Issue.objects.filter(project_id=sprint.id) #sic
        cost_summary['breakdown'] = MultipleIssueSummaryCalculator(user=user, issue_qs=issue_qs, summary_id=sprint.id).get_data()
        cost_summary['id'] = sprint.id
        cost_summary['projections'] = self._calculate_projections(cost_summary, sprint=sprint, user=user)
        cost_summary = self.clean_cost_summary(cost_summary, sprint.id, user)
        return cost_summary

    @classmethod
    def clean_snapshot(self, snapshot, sprint_id, user):
        sprint = Sprint.objects.get(pk=sprint_id)
        bp = ProjectPermissions.for_user(user, sprint.business)  # sic
        if not bp.has_view_ctc_billable_rates:
            snapshot.project_statement = "null"
            snapshot.time_summary = "null"
            snapshot.estimate_time_summary = "null"
            snapshot.cost_summary = "null"
        if not bp.has_view_invoices:
            snapshot.project_statement = "null"
        return snapshot
    
    @classmethod
    def clean_cost_summary(self, cost_summary, sprint_id, user):
        """ this function will need to be removed eventually, 
            for the moment it's here to keep the cleaning in one place """
        sprint = Sprint.objects.get(pk=sprint_id)
        bp = ProjectPermissions.for_user(user, sprint.business)  # sic
        if not bp.has_view_ctc_billable_rates:
            cost_summary['projections']['revised_dev_commission_cost'] = 0
            cost_summary['projections']['original_dev_commission_cost'] = 0
            clean_cost_summary = { 'id': ['id'],
                                   'sprint_id': cost_summary['sprint_id'],
                                   'projections': cost_summary['projections'],
                                   'progress_against_budget': cost_summary['progress_against_budget'] }
            cost_summary = clean_cost_summary
        return cost_summary

    @classmethod
    def _calculate_projections(self, cost_summary, sprint, user):
        bp = ProjectPermissions.for_user(user, sprint.business)  # sic
            
        projections = { 'original_dev_hours': 0,
                        'original_open_dev_hours': 0,
                        'original_dev_commission_cost': 0,
                        'revised_dev_hours': 0,
                        'revised_dev_commission_cost': 0}

        for dev_user_id, dev_user_data in cost_summary['per_user'].items():
            if dev_user_data['time_tracking_mode'] != 'developer':
                continue
            projections['original_dev_hours'] += dev_user_data['adjusted_points_non_management_no_scope_creep']
            projections['original_open_dev_hours'] += dev_user_data['adjusted_points_open_non_management_no_scope_creep'] 
            if bp.has_view_ctc_billable_rates:
                projections['original_dev_commission_cost'] += dev_user_data['adjusted_points_comparative_billable']
            
            revised_estimates_by_user = cost_summary['breakdown']['revised_estimates_by_user'].get(dev_user_id)
            if revised_estimates_by_user is None:
                continue
            projections['revised_dev_hours'] += revised_estimates_by_user['velocity_estimates']

            if bp.has_view_ctc_billable_rates:
                projections['revised_dev_commission_cost'] += revised_estimates_by_user['velocity_commission_cost']

        return projections
    
    def save(self, *args, **kwargs):
        was_created = not self.id

        super(SprintSnapshot, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)
    

class FeatureQuerySet(QuerySet):

    def order_by_project_id(self, project_id, parent_feature_id=None, descending=False):
        if project_id:
            direction = ("-" if descending else "") + "order"
            feature_ids_in_order = ProjectFeatureOrder.objects.filter(project_id=project_id)\
                                                              .order_by(direction)\
                                                              .values_list("feature_id", flat=True)
            if parent_feature_id is not None:
                feature_ids_in_order = feature_ids_in_order.filter(feature__parent_id=parent_feature_id)
                
            if feature_ids_in_order.count() == 0:
                return self
            preserved = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(feature_ids_in_order)])

            return self.order_by(preserved)
        else:
            return self
    
            
class Feature(BaseModel):
    number = models.IntegerField(null=True, blank=True, db_index=True)
    name = models.CharField(max_length=255, null=False, blank=False, db_index=True)
    project = ProtectedForeignKey(Project, null=False, blank=False, related_name="features")
    parent = ProtectedForeignKey("imptime.Feature", null=True, blank=True, related_name="children")
    description = models.TextField(null=True)
    issues = models.ManyToManyField(Issue, related_name="features")

    objects = FeatureQuerySet.as_manager()

    ROOT_NAME = "root"
    
    @classmethod
    def get_last_feature_number(self, project):
        largest_number =  Feature.objects.filter(project=project)\
                                         .filter(number__isnull=False)\
                                         .aggregate(largest_number=Max("number"))['largest_number']
        return largest_number or 0
    
    @classmethod
    def get_next_feature_number(self, project):
        return Feature.get_last_feature_number(project) +1

    @property
    def is_root(self):
        return self.name == self.project.name and self.parent_id is None
    
    @classmethod
    def ensure_root_feature_exists(self, project_id):
        root_node = Feature.objects.filter(number=1, project_id=project_id, parent_id=None, deleted=False).first()
        if root_node is None:
            project = Project.objects.get(pk=project_id)
            root_node = Feature.objects.get_or_create(name=project.name, number=1, project_id=project_id, parent_id=None, deleted=False)[0]
        return root_node

    @classmethod
    def get_root_feature(self, project_id):
        return self.ensure_root_feature_exists(project_id)
        
    def save(self, *args, **kwargs):
        was_created = not self.id
        super(Feature, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)
        if self.parent_id:
            self.parent.save()

    def delete(self):
        super(Feature, self).soft_delete()
        RefreshNotifier().notify_model_delete(self)

    def link_issue_to_testable(self, logged_in_user, issue_id, testable_id):
        testable = self.testables.get(pk=testable_id)
        bp = ProjectPermissions.for_user(logged_in_user, self.project)  # sic
        if not bp.has_edit_issues:
            raise Exception("Can't edit issues")
        issue = Issue.objects.get(pk=issue_id, project__business=self.project) #sic

        testable_name = testable.name or "Testable %d" % testable.order
        Testable.objects.create(issue=issue,
                                project=self.project, #sic
                                name=testable_name,
                                steps=testable.steps,
                                enriched_steps=testable.enriched_steps,
                                order=99)
        Testable.renumber_for_issue(issue.id)
        
        testable.implementing_issues.add(issue)
        testable.save()

        FeatureHistory.add_history(logged_in_user, self,
                                   "added implementing issue for testable %s" % testable.name,
                                   "", "%s %s" % (issue.number, issue.subject))

        IssueHistory.add_history(logged_in_user, issue,
                                 "added as implementing issue",
                                 "", "for feature %s %s" % (self.number, self.name))

        for vsf in self.visual_spec_features.all():
            annotated_vsd = AnnotatedVisualSpecDocument.clone(vsf.annotated_visual_spec_document)
            _, created = VisualSpecIssue.objects.get_or_create(annotated_visual_spec_document=annotated_vsd,
                                                               issue=issue,
                                                               defaults={'order':VisualSpecIssue.get_next_order(issue.id)})
            if created:
                IssueHistory.add_history(logged_in_user,
                                         issue,
                                         "linked attachment from feature %s %s" % (self.number, self.name),
                                         "",
                                         annotated_vsd.visual_spec_document.name)

        issue.save()
        self.save()

    def link_feature_to_issue_testable(self, logged_in_user, issue_testable):
        bp = ProjectPermissions.for_user(logged_in_user, self.project)  # sic
        if not bp.has_edit_issues:
            raise Exception("Can't edit issues")
        issue = issue_testable.issue

        feature_testable = issue_testable.copy()
        feature_testable.issue = None
        feature_testable.features.add(self)
        feature_testable.implementing_issues.add(issue)
        feature_testable.save()

        Testable.renumber_for_feature(self)

        FeatureHistory.add_history(logged_in_user, self,
                                   "added implementing issue for testable %s (from issue)" % feature_testable.name,
                                   "", "%s %s" % (issue.number, issue.subject))

        IssueHistory.add_history(logged_in_user, issue,
                                 "added as implementing issue (from issue)",
                                 "", "for feature %s %s" % (self.number, self.name))

        for vsf in issue.visual_spec_issues.all():
            annotated_vsd = AnnotatedVisualSpecDocument.clone(vsf.annotated_visual_spec_document)
            _, created = VisualSpecFeature.objects.get_or_create(annotated_visual_spec_document=annotated_vsd,
                                                                 feature=self,
                                                                 defaults={'order':VisualSpecFeature.get_next_order(issue.id)})
            if created:
                FeatureHistory.add_history(logged_in_user,
                                           self,
                                           "linked attachment from issue %s %s" % (issue.number, issue.subject),
                                           "",
                                           annotated_vsd.visual_spec_document.name)

        issue.save()
        self.save()

        
    def unlink_issue_from_testable(self, logged_in_user, testable_id, issue_id):
        testable = self.testables.get(pk=testable_id)
        bp = ProjectPermissions.for_user(logged_in_user, self.project)  # sic
        if not bp.has_edit_issues:
            raise Exception("Can't edit issues")
        issue = Issue.objects.get(pk=issue_id, project__business=self.project) #sic

        testable.implementing_issues.remove(issue)
        testable.save()

        FeatureHistory.add_history(logged_in_user, self,
                                   "removed implementing issue for testable %s" % testable.name,
                                   "%s %s" % (issue.number, issue.subject), "")

        IssueHistory.add_history(logged_in_user, issue,
                                 "removed as implementing issue",
                                 "for feature %s %s" % (self.number, self.name), "")

        issue.save()
        self.save()
        
class ProjectFeatureOrder(BaseModel):
    order = models.FloatField()
    feature = models.ForeignKey(Feature, related_name='project_feature_orders')
    project = models.ForeignKey(Project)

    class Meta:
        unique_together = ('project', 'feature')

    INCREMENT=10
    MAX_ORDER=999999

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(ProjectFeatureOrder, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self, params={'feature_id':str(self.feature_id)})
        else:
            RefreshNotifier().notify_model_update(self, params={'feature_id':str(self.feature_id)})

    @classmethod
    def renumber(self, project_id, parent_feature_id):
        feature_ids = Feature.objects.filter(project_id=project_id)\
                                     .order_by_project_id(project_id, parent_feature_id)\
                                     .values_list('pk', flat=True)
                                     
        if parent_feature_id is None:
            feature_ids = feature_ids.filter(parent_id__isnull=True)
        else:
            feature_ids = feature_ids.filter(parent_id=parent_feature_id)
                                             
        order = 0
        for feature_id in feature_ids:
            pio = ProjectFeatureOrder.objects.get_or_create(project_id=project_id, feature_id=feature_id,
                                                            defaults={'order':order})[0]
            if pio.order != order:
                pio.order = order
                pio.save()
            order += self.INCREMENT
        ProjectFeatureOrder.objects.filter(project_id=project_id).exclude(feature__project_id=project_id).delete()

    @classmethod
    def insert_before(self, feature, set_before_this_feature):
        if feature.project_id != set_before_this_feature.project_id:
            raise Exception("Cannot reorder, must be in the same project")
        feature.parent = set_before_this_feature.parent
        feature.save()
        self.renumber(feature.project_id, feature.parent_id)
        pio = self.objects.get_or_create(project_id=set_before_this_feature.project_id,
                                         feature_id=set_before_this_feature.id,
                                         defaults={'order':self.MAX_ORDER})[0]
        new_order = pio.order-1
        pio, is_new = self.objects.get_or_create(project_id=feature.project_id, feature_id=feature.id)
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(feature.project_id, feature.parent_id)

    @classmethod
    def insert_after(self, feature, set_after_this_feature):
        if feature.project_id != set_after_this_feature.project_id:
            raise Exception("Cannot reorder, must be in the same project")
        feature.parent = set_after_this_feature.parent
        feature.save()
        self.renumber(feature.project_id, feature.parent_id)
        pio_target = self.objects.get_or_create(project_id=set_after_this_feature.project_id,
                                                feature_id=set_after_this_feature.id,
                                                defaults={'order':self.MAX_ORDER})[0]
        new_order = pio_target.order+1
        pio, is_new = self.objects.get_or_create(project_id=feature.project_id,
                                                 feature_id=feature.id,
                                                 defaults={'order':new_order})
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(feature.project_id, feature.parent_id)

    @classmethod
    def insert_at_the_beginning(self, feature):
        new_order = -1
        pio, is_new = self.objects.get_or_create(project_id=feature.project_id,
                                                 feature_id=feature.id,
                                                 defaults={'order':new_order})
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(feature.project_id, feature.parent_id)

    @classmethod
    def insert_at_the_end(self, feature):
        new_order = self.get_next_order(feature.project_id, feature.parent_id)
        pio, is_new = self.objects.get_or_create(project_id=feature.project_id,
                                                 feature_id=feature.id,
                                                 defaults={'order':new_order})
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(feature.project_id, feature.parent_id)

    @classmethod
    def sort_these_feature_ids(self, project_id, unordered_feature_ids):
        return ProjectFeatureOrder.objects.filter(project=project_id)\
                                          .filter(feature_id__in=unordered_feature_ids)\
                                          .order_by("order")\
                                          .values_list("feature_id", flat=True)

    @classmethod
    def get_next_order(self, project_id, parent_feature_id, feature_qs=None):
        self.renumber(project_id, parent_feature_id)
        if feature_qs is None:
            feature_qs = Feature.objects.filter(project_id=project_id)
        if parent_feature_id is None:
            feature_qs = feature_qs.filter(parent_id__isnull=True)
        else:
            feature_qs = feature_qs.filter(parent_id=parent_feature_id)
        max_order = self.objects.filter(project_id=project_id, feature__in=feature_qs)\
                                .aggregate(max_order=Max('order'))['max_order'] or 0
        return max_order + self.INCREMENT

    @classmethod
    def get_previous_feature(self, feature):
        feature_order = ProjectFeatureOrder.objects.filter(feature=feature,
                                                           parent_id=feature.parent_id)\
                                                   .values("order").first()
        if feature_order is None:
            return None
        previous = ProjectFeatureOrder.objects.filter(project=feature.project_id,
                                                      parent_id=feature.parent_id,
                                                      order__lt=feature_order['order'])\
                                              .values("feature")\
                                              .order_by("-order").first()
        if previous is None:
            return None
        return previous['feature']
        

    
class FeatureHistory(BaseModel):
    feature_id = models.IntegerField(blank=False, null=False, db_index=True)
    original_feature = models.ForeignKey(Feature, null=True, db_index=True, on_delete=SET_NULL, related_name="histories")
    created_by = models.ForeignKey(User, blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=False, null=False)
    before = models.TextField(blank=True, null=True)
    after = models.TextField(blank=True, null=True)
    
    @classmethod
    def add_history(self, user, feature, description, before, after):
        FeatureHistory.objects.create(created_by=user,
                                    original_feature=feature,
                                    feature_id=feature.id,
                                    description=description,
                                    before=before, after=after)

    @classmethod
    def for_feature(self, feature):
        return FeatureHistory.objects.filter(feature_id=feature.id).order_by("-created_at")
    
class DecisionJournal(BaseModel):
    project = models.ForeignKey(Project)
    decision_made_at = models.DateTimeField(null=False)
    decision_made_by = ProtectedForeignKey(User, blank=False, null=False)
    decision = models.TextField(null=True, blank=True)
    reason = models.TextField(null=True, blank=True)
    context = models.TextField(null=True, blank=True)
    repercussions = models.TextField(null=True, blank=True)

    def delete(self):
        super(DecisionJournal, self).soft_delete()
        RefreshNotifier().notify_model_delete(self)

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(DecisionJournal, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

        
class DecisionJournalHistory(BaseModel):
    decision_journal_id = models.IntegerField(blank=False, null=False, db_index=True)
    original_decision_journal = models.ForeignKey(DecisionJournal, null=True, db_index=True, on_delete=SET_NULL, related_name="histories")
    created_by = models.ForeignKey(User, blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=False, null=False)
    before = models.TextField(blank=True, null=True)
    after = models.TextField(blank=True, null=True)
    
    @classmethod
    def add_history(self, user, decision_journal, description, before, after):
        DecisionJournalHistory.objects.create(created_by=user,
                                              original_decision_journal=decision_journal,
                                              decision_journal_id=decision_journal.id,
                                              description=description,
                                              before=before, after=after)

    @classmethod
    def for_decision_journal(self, decision_journal):
        return DecisionJournalHistory.objects.filter(decision_journal_id=decision_journal.id).order_by("-created_at")
    
