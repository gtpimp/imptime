import datetime
import timings
import itertools
from django.db.models import Case, When, SET_NULL
from lib.quality_helper import Quality
from django.core.urlresolvers import reverse
import os
from dateutil.relativedelta import relativedelta
import api
from lib import date_helper
import calendar
from lib.models import model_to_dict_with_date_support
from impasync.refresh_notifier import RefreshNotifier
from caldav_helper import CalDavHelper
from lib.fields import UploadTo, ProtectedForeignKey
import uuid
from colorful.fields import RGBColorField
from interface_plugin import get_interface_plugin
import re
import logging
from decimal import Decimal
from django.db.models import Count
from django.db.models.query import QuerySet
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError, NON_FIELD_ERRORS
from django.db import models
from django.db.models import Q, Avg, Sum, Max, Min, F
from django.utils.datastructures import OrderedDict
from re import sub as re_sub
from re import UNICODE as re_UNICODE
from checklist_plugins.registry import get_traffic_plugins, get_dev_plugins, get_finance_plugins
from django.contrib.auth.models import AbstractUser, AbstractBaseUser
from lib.models import BaseModel

from django.dispatch import receiver
from django.db.models.signals import post_save

logger = logging.getLogger(__name__)

from django.utils import timezone
from timepiece import utils

from dateutil.relativedelta import relativedelta
from dateutil import rrule

from datetime import timedelta, date

COLOURS = ["#F0F8FF","#FAEBD7","#00FFFF","#7FFFD4","#F0FFFF","#F5F5DC","#FFE4C4","#FFEBCD","#0000FF","#8A2BE2","#A52A2A","#DEB887","#5F9EA0","#7FFF00","#D2691E","#FF7F50","#6495ED","#FFF8DC","#DC143C","#00FFFF","#00008B","#008B8B","#B8860B","#A9A9A9","#006400","#BDB76B","#556B2F","#FF8C00","#9932CC","#E9967A","#8FBC8F","#483D8B","#2F4F4F","#00CED1","#9400D3","#FF1493","#00BFFF","#696969","#1E90FF","#B22222","#FFFAF0","#228B22","#FF00FF","#DCDCDC","#F8F8FF","#FFD700","#DAA520","#BEBEBE","#808080","#00FF00","#008000","#ADFF2F","#F0FFF0","#FF69B4","#CD5C5C","#4B0082","#FFFFF0","#F0E68C","#E6E6FA","#FFF0F5","#7CFC00","#FFFACD","#ADD8E6","#F08080","#E0FFFF","#FAFAD2","#D3D3D3","#90EE90","#FFB6C1","#FFA07A","#20B2AA","#87CEFA","#778899","#B0C4DE","#00FF00","#32CD32","#FAF0E6","#FF00FF","#B03060","#7F0000","#66CDAA","#0000CD","#BA55D3","#9370DB","#3CB371","#7B68EE","#00FA9A","#48D1CC","#C71585","#191970","#F5FFFA","#FFE4E1","#FFE4B5","#FFDEAD","#000080","#FDF5E6","#808000","#6B8E23","#FFA500","#FF4500","#DA70D6","#EEE8AA","#98FB98","#AFEEEE","#DB7093","#FFEFD5","#FFDAB9","#CD853F","#FFC0CB","#DDA0DD","#B0E0E6","#A020F0","#7F007F","#FF0000","#BC8F8F","#4169E1","#8B4513","#FA8072","#F4A460","#2E8B57","#FFF5EE","#A0522D","#C0C0C0","#87CEEB","#6A5ACD","#708090","#FFFAFA","#00FF7F","#4682B4","#D2B48C","#008080","#D8BFD8","#FF6347","#40E0D0","#EE82EE","#F5DEB3","#F5F5F5","#FFFF00","#9ACD32"]

ISSUE_DEV_COMPLETED_STATES = ["devdone", "dev done", "tested", "internal_qa_passed", "cannot reproduce"]
TIME_TRACKING_MODES = [ "developer", "tester", "manager" ]
TIME_TRACKING_MODES_WITHOUT_VELOCITY = [ "tester", "manager" ]

upload_to_logos = UploadTo("logos")
upload_to_attachments = UploadTo("issue_attachments")
upload_to_project_documents = UploadTo("project_documents")

class Company(BaseModel):
    name = models.CharField(max_length=255, null=False, blank=True)
    code = models.CharField(max_length=100, null=False, blank=True)
    email = models.EmailField(null=False, blank=False)
    logo = models.FileField(max_length=255, upload_to=upload_to_logos, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.name


class Attribute(BaseModel):
    ATTRIBUTE_TYPES = (
        ('project-type', 'Project Type'),
        ('project-status', 'Project Status'),
    )
    SORT_ORDER_CHOICES = [(x, x) for x in xrange(-20, 21)]
    type = models.CharField(max_length=32, choices=ATTRIBUTE_TYPES)
    label = models.CharField(max_length=255)
    sort_order = models.SmallIntegerField(
        null=True,
        blank=True,
        choices=SORT_ORDER_CHOICES,
    )
    enable_timetracking = models.BooleanField(default=False,
        help_text='Enable time tracking functionality for projects with this '
                  'type or status.',
    )
    billable = models.BooleanField(default=False)

    class Meta:
        unique_together = ('type', 'label')
        ordering = ('sort_order',)

    def __unicode__(self):
        return self.label

class BusinessQuerySet(QuerySet):

    def filter_by_logged_in_user(self, user):
        """ restricts entries to those belonging to projects the given
        user (typically the logged in user) is assigned to """
        return self.filter(pk__in=BusinessPermissions.active_businesses_for_user(user))

    def filter_has_any_active_projects(self):
        return self.filter(new_business_projects__status3__name__in=Project.active_states())

    def filter_has_only_pending_projects(self):
        return self.filter(new_business_projects__status3__name__in=Project.pending_states()).exclude(new_business_projects__status3__name__in=Project.active_states())

    def filter_has_only_closed_projects(self):
        return self.exclude(new_business_projects__status3__name__in= Project.pending_states()+Project.active_states()+Project.hopeful_states() )

    def filter_has_at_least_one_open_project(self):
        return self.filter( new_business_projects__status3__name__in=Project.pending_states()+Project.active_states()+Project.hopeful_states() )

    def filter_has_hopeful_projects(self):
        return self.filter(new_business_projects__status3__name__in=Project.hopeful_states())

    def exclude_has_closed_projects(self):
        return self.filter(new_business_projects__status3__name__in=Project.pending_states()+Project.active_states() )

    def filter_has_can_add_dev_time_projects(self):
        return self.filter(new_business_projects__status3__name__in=Project.can_add_dev_time_states())

    def get_checklist_summary(self):

        res = { 'traffic_ok': True, 'dev_ok': True, 'finance_ok': True }
        for business in self:
            res['traffic_ok'] = res['traffic_ok'] and business.has_recent_passed_traffic_checklist()
            res['dev_ok'] = res['dev_ok'] and business.has_recent_passed_dev_checklist()
            res['finance_ok'] = res['finance_ok'] and business.has_recent_passed_finance_checklist()
        return res

    def budget(self):
        return self.aggregate(total=Sum('new_business_projects__budget'))['total']

class Business(BaseModel):

    DEFAULT_STATUS_COLOURS = COLOURS

    class Meta:
        ordering = ('name',)

    name = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    email = models.EmailField(blank=True)
    description = models.TextField(blank=True)
    created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='businesses_created_by', null=True, blank=True)
    modified = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)
    external_id = models.CharField(max_length=32, blank=True)
    objects = BusinessQuerySet.as_manager()
    sync_with = models.CharField( max_length=100, blank=True, null=True, choices=( ("jira", "Jira"), ) )
    invoice_method = models.CharField( max_length=50, blank=False, null=False,
                                       default="billable_hours_per_sprint",
                                       choices=( ("billable_hours_per_sprint", "Billable Hours per Sprint"),
                                                 ("billable_hours_per_month", "Billable Hours per Month"),
                                                 ("fixed_quote", "Fixed quote"),
                                                 ("free", "Free or Equity or Other") ) )

    impd_client = models.ForeignKey(Company, null=True, blank=False, related_name='businesses')
    point_person = models.ForeignKey(User, limit_choices_to={'is_staff': True}, null=True)
    archived = models.BooleanField(default=False, db_index=True)

    def model_to_dict(self):
        d = model_to_dict_with_date_support(self)
        return d

    def wiki_name(self):
        return self.name.replace(" ", "_").lower()

    def inbox_email_name(self):
        return self.convert_to_email_name(self.name)

    @classmethod
    def convert_to_email_name(self, name):
        return name.replace(" ","").lower()
    
    def has_recent_traffic_checklist(self):
        return TrafficChecklist.objects.filter(business=self).filter(created_at__gte=datetime.datetime.today()-timedelta(days=settings.NUM_DAYS_FOR_TRAFFIC_SPRINT_CHECKLISTS)).count() > 0

    def has_recent_dev_checklist(self):
        return DevChecklist.objects.filter(business=self).filter(created_at__gte=datetime.datetime.today()-timedelta(days=settings.NUM_DAYS_FOR_DEV_SPRINT_CHECKLISTS)).count() > 0

    def has_recent_finance_checklist(self):
        return FinanceChecklist.objects.filter(business=self).filter(created_at__gte=datetime.datetime.today()-timedelta(days=settings.NUM_DAYS_FOR_FINANCE_SPRINT_CHECKLISTS)).count() > 0

    def has_recent_passed_traffic_checklist(self):
        cl = TrafficChecklist.objects.filter(business=self).order_by("-pk").first()
        return cl is not None and cl.passed

    @property
    def client(self):
        from invoicing.models import Invoice
        try:
            return Invoice.objects.filter(business=self).first().client
        except:
            return None

    def has_recent_passed_dev_checklist(self):
        cl = DevChecklist.objects.filter(business=self).order_by("-pk").first()
        return cl is not None and cl.passed

    def has_recent_passed_finance_checklist(self):
        cl = FinanceChecklist.objects.filter(business=self).order_by("-pk").first()
        return cl is not None and cl.passed

    @property
    def allowed_user_ids(self):
        project_users = BusinessPermissions.active_users_for_business(business_id=self.id)
        return project_users.values_list('id', flat=True).order_by("username")
 
    @property
    def sprints(self):
        return Project.objects.filter(business=self)

    def get_ordered_projects(self):
        return Project.objects.filter(business=self).order_by_business_id(self.id)

    def get_users_allowed_to_estimate_on_business(self, current_user):
        business_permissions_by_user = BusinessPermissions.by_user(self)
        bp = BusinessPermissions.objects.get_or_create(business=self,user=current_user)[0]
        can_view_other_user_points = bp.has_see_other_user_points

        if can_view_other_user_points:
            users = BusinessPermissions.active_users_for_business(self)
            business_users = users.filter(id__in = business_permissions_by_user.keys())
            developers = [user for user in business_users if business_permissions_by_user[user.id].has_estimate_own_points]
            support_staff = [ user for user in business_users if Rate.for_business(user.id, self.id) and Rate.for_business(user.id, self.id).time_tracking_mode in [ 'tester', 'manager' ] ]
            users = list(set(developers + support_staff))
        else:
            if bp.has_estimate_own_points:
                users = User.objects.filter(id__in = [current_user.id])
            else:
                users = User.objects.none()
        return users

    def create_default_statuses(self):
        for code, name in Issue.ISSUE_STATUS_CHOICES:
            IssueStatus.objects.get_or_create(name=name, business=self)
        for code, name in Project.PROJECT_STATUSES:
            ProjectStatus.objects.get_or_create(name=name, business=self)
        for code, name in ProjectDeadlineType.DEFAULT_PROJECT_DEADLINE_TYPES:
            ProjectDeadlineType.objects.get_or_create(name=name, business=self)
        for code, name in ProjectRole.DEFAULT_PROJECT_ROLES:
            ProjectRole.objects.get_or_create(name=name, business=self)

    def get_traffic_owners(self):
        return [x.user for x in BusinessPermissions.objects.filter(business=self, can_do_traffic_checklist=True)]

    def get_dev_owners(self):
        return [x.user for x in BusinessPermissions.objects.filter(business=self, can_do_dev_checklist=True)]

    def get_finance_owners(self):
        return [x.user for x in BusinessPermissions.objects.filter(business=self, can_do_finance_checklist=True)]

    def get_most_recent_open_project_id(self, user_id):
        projects = Project.objects.filter(business=self)\
                                  .filter_open()\
                                  .filter(project_type__in=["sprint", "checklist", "audit"])
        if len(projects) == 0:
            return self.ensure_single_sprint().id
        entries = Entry.objects.filter(user_id=user_id, issue__project__in=projects).order_by('-end_time').values('issue__project_id')
        if len(entries) > 0:
            return entries[0]['issue__project_id']
        return projects.order_by("-id").values("id")[0]['id']
    
    def get_all_business_permissions(self,user=None):
        permissions_qs = BusinessPermissions.objects.filter(business=self)
        if user is not None:
            try:
                return permissions_qs.get(user=user)
            except BusinessPermissions.DoesNotExist:
                if user in self.users:
                    return BusinessPermissions.objects.create(user=user, business=self)
                else:
                    return None

        business_users = self.users
        user_ids = [u.id for u in business_users]
        permissions_qs = permissions_qs.filter(user__id__in = user_ids)
        if len(permissions_qs) != len(business_users):
            for user in business_users:
                try:
                    user_perm = permissions_qs.get(user=user)
                except BusinessPermissions.DoesNotExist:
                    user_perm = BusinessPermissions.objects.create(user=user, business=self)
        return BusinessPermissions.objects.filter(Q(business = self) & Q(user__id__in = user_ids) )

    def has_closed_sprints(self):
        projects = Project.objects.filter(business=self)
        try:
            [ p for p in projects if not p.is_open ][0]
            return True
        except IndexError:
            return False

    def has_open_sprints(self):
        projects = Project.objects.filter(business=self)
        try:
            [ p for p in projects if p.is_open ][0]
            return True
        except IndexError:
            return False

    @property
    def users(self):

        return BusinessPermissions.active_users_for_business(self.id)

        # user_ids =  Project.objects.filter(business__id = self.id).values_list("users", flat=True)
        # user_ids = [user_id for user_id in user_ids if user_id is not None]
        # user_ids = list(set(user_ids))
        # return_users = []
        # for user_id in user_ids:
        #     return_users.append(User.objects.get(id=user_id))
        # return return_users

    def get_colour_for_status(self, status_name):
        possible_states = [x['status2__name'] for x in Issue.objects.filter(project__business=self).values('status2__name').order_by("status2__name").distinct()]
        index = possible_states.index(status_name)
        index = index % len(Business.DEFAULT_STATUS_COLOURS)
        return Business.DEFAULT_STATUS_COLOURS[index]

    def get_colour(self):
        index = self.id % len(COLOURS)
        threshold = int("0x999999", 0)
        c = COLOURS[index]
        c_int = int("0x"+c[1:], 0)
        if c_int < threshold:
            c_int = int("0xffffff",0) - c_int
            c = "#"+hex(c_int)[2:]
        return c

    def ensure_single_sprint(self, **kwargs):
        kwargs = kwargs or {}
        kwargs.update({"name":"Sprint0",
                       "business":self ,
                       "type":Attribute.objects.get(label="default"),
                       "status3":ProjectStatus.objects.get_or_create(name="pending", business=self)[0]
                       })

        if len(Project.objects.filter(business = self)) == 0:
            return Project.objects.create(**kwargs);

    def save(self, *args, **kwargs):
        queryset = Business.objects.all()
        was_created = not self.id
        if not self.slug:
            if self.id:
                queryset = queryset.exclude(id__exact=self.id)
            self.slug = utils.slugify_uniquely(self.name, queryset, 'slug')
        super(Business, self).save(*args, **kwargs)

        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    @classmethod
    def businesses_in_desc_order_of_use(self, user):
        businesses = Business.objects.annotate(models.Min("new_business_projects__entries__end_time")).order_by("-new_business_projects__entries__end_time__min")
        business_ids = []
        for business in businesses:
            if BusinessPermissions.objects.get_or_create(business=business,user=user)[0].is_active_member_of_business:
                business_ids.append(business.id)
        businesses = businesses.filter(id__in=business_ids)
        return businesses

    def __unicode__(self):
        return self.name

    @property
    def end_time(self):
        entries = Entry.objects.filter(issue__project__business=self).order_by("-end_time")
        if entries.count()>0:
            return entries[0].end_time
        else:
            return None

    @classmethod
    def get_related_business_by_user(cls, user):
        return cls.objects.all().filter_by_logged_in_user(user).distinct()

    # def delete(self, *args, **kwargs):
    #     params = self.get_object()
    #     RefreshNotifier().notify_model_delete(self, params)
    #     super(Business, self).delete(*args, **kwargs)
    

class BusinessComment(BaseModel):
    business = models.ForeignKey(Business, null=False, blank=False, related_name='business_comments')
    comment = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(User, null=False, blank=False, related_name='business_comments_modified_by')

    def __unicode__(self):
        return self.comment

class GlobalPermissions():
    """Semi hck so that one user has ability to add release notes. superuser
       should have no meaning anywhere else."""

    def has_update_release_notes_permission(self, user):
        return user and user.is_superuser

class BusinessPermissions(BaseModel):

    class Meta:
        unique_together = (('user','business'),)

    business = models.ForeignKey(Business, related_name='business_permissions', db_index=True)
    user = models.ForeignKey(User, related_name='business_permissions', db_index=True)

    can_invite_users = models.BooleanField(default=False, verbose_name="Can Invite Users")
    can_set_user_permissions = models.BooleanField(default=False, verbose_name="Can Set User Permissions")
    is_active_member_of_business = models.BooleanField(default=True, verbose_name="Is An Active Member of This Business")

    can_view_project_card = models.BooleanField(default=True, verbose_name="Can View Sprint Card")
    can_edit_issues = models.BooleanField(default=True, verbose_name="Can Edit Issues")
    can_view_issues = models.BooleanField(default=True, verbose_name="Can View Issues")
    can_share_issues = models.BooleanField(default=True, verbose_name="Can Share Issues")
    can_edit_issue_states = models.BooleanField(default=True, verbose_name="Can Edit Issue States")
    can_edit_project_states = models.BooleanField(default=True, verbose_name="Can Edit Sprint States")
    can_add_issue = models.BooleanField(default=True, verbose_name="Can Add Issue")
    can_delete_issue = models.BooleanField(default=True, verbose_name="Can Delete Issue")
    can_delete_project = models.BooleanField(default=True, verbose_name="Can Delete Project")
    can_edit_description = models.BooleanField(default=True, verbose_name="Can Edit Description")
    can_add_issue_comment = models.BooleanField(default=True, verbose_name="Can Add Issue Comment")
    can_edit_subject = models.BooleanField(default=True, verbose_name="Can Edit Subject")
    can_edit_feature = models.BooleanField(default=True, verbose_name="Can Edit Feature")
    can_edit_tags = models.BooleanField(default=True, verbose_name="Can Edit Tags")
    can_create_sprint = models.BooleanField(default=True, verbose_name="Can Create Sprint")
    can_edit_sprint_status = models.BooleanField(default=True, verbose_name="Can Edit Sprint Status")
    can_edit_sprint_type = models.BooleanField(default=True, verbose_name="Can Edit Sprint Type")
    can_edit_sprint = models.BooleanField(default=True, verbose_name="Can Edit Sprint")
    can_assign_user = models.BooleanField(default=True, verbose_name="Can Assign User")
    can_be_scheduled = models.BooleanField(default=False, verbose_name="Can Be Scheduled")
    can_view_business_comments = models.BooleanField(default=False, verbose_name="Can view project comments")
    can_view_testables = models.BooleanField(default=True, verbose_name="Can View Testables")
    can_view_issue_history = models.BooleanField(default=True, verbose_name="Can View Issue History")
    can_view_decision_journal = models.BooleanField(default=False, verbose_name="Can View Decision Journal")
    can_edit_decision_journal = models.BooleanField(default=False, verbose_name="Can Edit Decision Journal")

    can_view_actual_hours = models.BooleanField(default=False, verbose_name="Can View Actual Hours")
    can_see_other_user_points = models.BooleanField(default=False, verbose_name="Can See Other User's Points")
    can_estimate_own_points = models.BooleanField(default=False, verbose_name="Can Estimate Own Points")
    can_view_calendar = models.BooleanField(default=False, verbose_name="Can View Calendar")
    can_import_actual_hours = models.BooleanField(default=False, verbose_name="Can Import Actual Hours")
    can_edit_business_comments = models.BooleanField(default=False, verbose_name="Can edit project comments")
    can_view_review_cycle = models.BooleanField(default=False, verbose_name="Can View Review Cycle")
    can_edit_old_clock_entries = models.BooleanField(default=False, verbose_name="Can Edit Old Clock Entries")

    can_do_dev_checklist = models.BooleanField(default=False, verbose_name="Do dev checklist")
    can_do_traffic_checklist = models.BooleanField(default=False, verbose_name="Traffic checklist")
    can_do_finance_checklist = models.BooleanField(default=False, verbose_name="Finance checklist")

    can_edit_review_cycle = models.BooleanField(default=False, verbose_name="Can Edit Review Cycle")
    can_edit_permissions = models.BooleanField(default=False, verbose_name="Can Edit Permissions")
    can_view_permissions = models.BooleanField(default=False, verbose_name="Can View Permissions")
    can_toggle_graphs = models.BooleanField(default=False, verbose_name="Can Toggle Graphs")
    can_edit_project_detail = models.BooleanField(default=False, verbose_name="Can Edit Sprint Detail")
    can_edit_deadlines = models.BooleanField(default=False,verbose_name = "Can Edit Deadlines ")
    can_view_deadlines = models.BooleanField(default=False,verbose_name = "Can View Deadlines ")
    can_edit_budget = models.BooleanField(default=False,verbose_name = "Can Edit Budget ")
    can_view_budget = models.BooleanField(default=False, verbose_name="Can View Budget")
    can_edit_invoices = models.BooleanField(default=False, verbose_name="Can Edit Invoices")
    can_view_invoices = models.BooleanField(default=False, verbose_name="Can View Invoices")
    can_edit_quotes = models.BooleanField(default=False, verbose_name="Can Edit Quotes")
    can_view_quotes = models.BooleanField(default=False, verbose_name="Can View Quotes")
    can_edit_velocity = models.BooleanField(default=False, verbose_name="Can Edit Velocity")
    can_view_velocity = models.BooleanField(default=False, verbose_name="Can View Velocity")
    can_edit_ctc_billable_rates = models.BooleanField(default=False, verbose_name="Can Edit Ctc Billable")
    can_view_ctc_billable_rates = models.BooleanField(default=False, verbose_name="Can View Ctc Billable")
    can_view_ctc_rates = models.BooleanField(default=False, verbose_name="Can View Ctc") # a subpermission of can_view_ctc_billable_rates, used for clients who shouldn't see our internal costing.
    can_view_documents = models.BooleanField(default=False, verbose_name="Can View Docs") # quotes and summaries, usually contains costs and rates
    can_edit_calendar = models.BooleanField(default=False, verbose_name="Can Edit Calendar")

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(BusinessPermissions, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(
                self, params={'projects': [self.business_id],
                              'users': [self.user_id]},
                name='projectpermissions')
        else:
            RefreshNotifier().notify_model_update(
                self, params={'projects': [self.business_id],
                              'users': [self.user_id]},
                name='projectpermissions')

    @classmethod
    def _by_user(self, business):
        # to be deprecated
        bps = BusinessPermissions.objects.filter(business=business)
        return dict( [ (bp.user.id, bp) for bp in bps ] )

    def update_permission(self, permission_name, new_state, save=True):

        field_name = permission_name.replace("has_", "can_")
        if not hasattr(self, field_name):
            raise Exception("Trying to set unknown permission: %s " % permission_name)
        setattr(self, field_name, new_state)
        if save:
            self.save()

    @classmethod
    def by_user(self, business):
        # to be deprecated
        return self._by_user(business)

    @classmethod
    def ensure_user_belongs_to_business(self, user, business):
        bp = BusinessPermissions.objects.get_or_create(business=business,
                                                       user=user)[0]
        bp.is_active_member_of_business = True
        bp.save()
        return bp

    @classmethod
    def give_all_permissions_to_user(self, user, business):
        bp = self.ensure_user_belongs_to_business(user=user, business=business)
        bp.can_invite_users = True
        bp.can_set_user_permissions = True
        bp.can_view_project_card = True
        bp.can_edit_issues = True
        bp.can_view_issues = True
        bp.can_share_issues = True
        bp.can_edit_issue_states = True
        bp.can_edit_project_states = True
        bp.can_add_issue = True
        bp.can_delete_issue = True
        bp.can_delete_project = True
        bp.can_edit_description = True
        bp.can_add_issue_comment = True
        bp.can_edit_subject = True
        bp.can_edit_feature = True
        bp.can_edit_tags = True
        bp.can_create_sprint = True
        bp.can_edit_sprint_status = True
        bp.can_edit_sprint_type = True
        bp.can_edit_sprint = True
        bp.can_assign_user = True
        bp.can_be_scheduled = True
        bp.can_view_business_comments = True
        bp.can_view_testables = True
        bp.can_view_issue_history = True
        bp.can_view_decision_journal = False
        bp.can_edit_decision_journal = False
        bp.can_view_actual_hours = True
        bp.can_see_other_user_points = True
        bp.can_estimate_own_points = False #typically project creators won't be estimators
        bp.can_view_calendar = True
        bp.can_import_actual_hours = True
        bp.can_edit_business_comments = True
        bp.can_view_review_cycle = True
        bp.can_edit_old_clock_entries = True
        bp.can_do_dev_checklist = True
        bp.can_do_traffic_checklist = True
        bp.can_do_finance_checklist = True
        bp.can_edit_review_cycle = True
        bp.can_edit_permissions = True
        bp.can_view_permissions = True
        bp.can_toggle_graphs = True
        bp.can_edit_project_detail = True
        bp.can_edit_deadlines = True
        bp.can_view_deadlines = True
        bp.can_edit_budget = True
        bp.can_view_budget = True
        bp.can_edit_invoices = True
        bp.can_view_invoices = True
        bp.can_edit_quotes = True
        bp.can_view_quotes = True
        bp.can_edit_ctc_billable_rates = True
        bp.can_view_ctc_billable_rates = True
        bp.can_view_ctc_rates = True
        bp.can_view_documents = True
        bp.can_edit_calendar = True
        bp.can_view_velocity = True
        bp.can_edit_velocity = True
        bp.save()
    
    @classmethod
    def for_user(self, user, business=None, auto_create=True):
        qs = user.business_permissions
        if business is not None:
            qs = qs.filter(business=business)

        bp = qs.first()
        if bp is None:
            if auto_create:
                return self.objects.get_or_create(business=business, user=user)[0]
            else:
                return None
        else:
            return qs.first()

    @classmethod
    def viewable_users(self, user):
        """ returns all users that this user could know about, based on which businesses they have in common """
        business_ids = BusinessPermissions.objects.filter(user=user,
                                                          is_active_member_of_business=True)\
                                                  .values_list('business_id', flat=True)

        return User.objects.filter(business_permissions__business_id__in=business_ids,
                                   business_permissions__is_active_member_of_business=True)

    @classmethod
    def active_businesses_for_user(self, user):
        bps = self.objects.filter(user=user, is_active_member_of_business=True)
        return Business.objects.filter(business_permissions__in=bps)

    @classmethod
    def active_users_for_business(self, business_id):
        return User.objects.filter(business_permissions__business_id=business_id,
                                   business_permissions__is_active_member_of_business=True).distinct()

    @classmethod
    def get_users_who_can_capture_time(self, business_id=None):
        if business_id is None:
            users = User.objects.filter(is_active=True, business_permissions__is_active_member_of_business=True,
                                        business_permissions__business__new_business_projects__status3__name='in dev').distinct()
        else:
            users = User.objects.filter(is_active=True,
                                        business_permissions__business_id=business_id,
                                        business_permissions__is_active_member_of_business=True)\
                                .distinct()
        return users

    @classmethod
    def get_users_who_can_estimate_time(self, business_id=None):
        if business_id is None:
            users = User.objects.filter(is_active=True, business_permissions__is_active_member_of_business=True,
                                        business_permissions__business__new_business_projects__status3__name='in dev').distinct()
        else:
            users = User.objects.filter(is_active=True,
                                        business_permissions__business_id=business_id,
                                        business_permissions__is_active_member_of_business=True,
                                        business_permissions__can_estimate_own_points=True)\
                                .distinct()
        return users

    
    @property
    def has_view_project_card(self):
        return self.is_active_member_of_business and self.can_view_project_card

    @property
    def has_invite_users(self):
        return self.is_active_member_of_business and self.can_invite_users

    @property
    def has_set_user_permissions(self):
        return self.is_active_member_of_business and self.can_set_user_permissions

    @property
    def has_is_active_member_of_business(self):
        return self.is_active_member_of_business

    @property
    def has_edit_review_cycle(self):
        return self.is_active_member_of_business and self.can_edit_review_cycle

    @property
    def has_view_review_cycle(self):
        return self.is_active_member_of_business and self.can_view_review_cycle

    @property
    def has_edit_old_clock_entries(self):
        return self.is_active_member_of_business and self.can_edit_old_clock_entries
    
    @property
    def has_edit_permissions(self):
        return self.is_active_member_of_business and self.can_edit_permissions

    @property
    def has_view_permissions(self):
        return self.is_active_member_of_business and self.can_view_permissions

    @property
    def has_edit_project_detail(self):
        return self.is_active_member_of_business and self.can_edit_project_detail

    @property
    def has_edit_issues(self):
        return self.is_active_member_of_business and self.can_edit_issues

    @property
    def has_share_issues(self):
        return self.is_active_member_of_business and self.can_share_issues
    
    @property
    def has_view_issues(self):
        return self.is_active_member_of_business and self.can_view_issues

    @property
    def has_edit_budget(self):
        return self.is_active_member_of_business and self.can_edit_budget
    
    @property
    def has_view_budget(self):
        return self.is_active_member_of_business and self.can_view_budget

    @property
    def has_edit_deadlines(self):
        return self.is_active_member_of_business and self.can_edit_deadlines
    
    @property
    def has_view_deadlines(self):
        return self.is_active_member_of_business and self.can_view_deadlines

    @property
    def has_edit_invoices(self):
        return self.is_active_member_of_business and self.can_edit_invoices
    
    @property
    def has_view_invoices(self):
        return self.is_active_member_of_business and self.can_view_invoices

    @property
    def has_edit_quotes(self):
        return self.is_active_member_of_business and self.can_edit_quotes
    
    @property
    def has_view_quotes(self):
        return self.is_active_member_of_business and self.can_view_quotes

    @property
    def has_edit_velocity(self):
        return self.is_active_member_of_business and self.can_edit_velocity

    @property
    def has_view_velocity(self):
        return self.is_active_member_of_business and self.can_view_velocity
    
    @property
    def has_edit_ctc_billable_rates(self):
        return self.is_active_member_of_business and self.can_edit_ctc_billable_rates

    @property
    def has_view_ctc_billable_rates(self):
        """ means the section containing costs like billable or ctc.
            Doesn't confer ctc viewing by itself,
            a users needs to have 'has_view_ctc_rates' too.  """
        return self.is_active_member_of_business and self.can_view_ctc_billable_rates

    @property
    def has_view_ctc_rates(self):
        """ means specifically can view the ctc rates.  """
        return self.is_active_member_of_business and self.can_view_ctc_rates

    @property
    def has_view_actual_hours(self):
        return self.is_active_member_of_business and self.can_view_actual_hours

    @property
    def has_toggle_graphs(self):
        return self.is_active_member_of_business and self.can_toggle_graphs

    @property
    def has_edit_issue_states(self):
        return self.is_active_member_of_business and self.can_edit_issue_states

    @property
    def has_edit_project_states(self):
        return self.is_active_member_of_business and self.can_edit_project_states

    @property
    def has_see_other_user_points(self):
        return self.is_active_member_of_business and self.can_see_other_user_points

    @property
    def has_estimate_own_points(self):
        return self.is_active_member_of_business and self.can_estimate_own_points

    @property
    def has_add_issue(self):
        return self.is_active_member_of_business and self.can_add_issue
    
    @property
    def has_delete_issue(self):
        return self.is_active_member_of_business and self.can_delete_issue

    @property
    def has_delete_project(self):
        return self.is_active_member_of_business and self.can_delete_project
    
    @property
    def has_edit_description(self):
        return self.is_active_member_of_business and self.can_edit_description

    @property
    def has_add_issue_comment(self):
        return self.is_active_member_of_business and self.can_add_issue_comment

    @property
    def has_edit_subject(self):
        return self.is_active_member_of_business and self.can_edit_subject

    @property
    def has_edit_feature(self):
        return self.is_active_member_of_business and self.can_edit_feature

    @property
    def has_edit_issue_feature(self):
        return self.is_active_member_of_business and self.has_edit_feature

    @property
    def has_edit_tags(self):
        return self.is_active_member_of_business and self.can_edit_tags

    @property
    def has_create_sprint(self):
        return self.is_active_member_of_business and self.can_create_sprint

    @property
    def has_edit_sprint_status(self):
        return self.is_active_member_of_business and self.can_edit_sprint_status

    @property
    def has_edit_sprint_type(self):
        return self.is_active_member_of_business and self.can_edit_sprint_type

    @property
    def has_edit_sprint(self):
        return self.is_active_member_of_business and self.can_edit_sprint

    @property
    def has_assign_user(self):
        return self.is_active_member_of_business and self.can_assign_user

    @property
    def has_view_business_comments(self):
        return self.is_active_member_of_business and self.can_view_business_comments

    @property
    def has_view_testables(self):
        return self.is_active_member_of_business and self.can_view_testables

    @property
    def has_view_issue_history(self):
        return self.is_active_member_of_business and self.can_view_issue_history

    @property
    def has_view_decision_journal(self):
        return self.is_active_member_of_business and self.can_view_decision_journal

    @property
    def has_edit_decision_journal(self):
        return self.is_active_member_of_business and self.can_edit_decision_journal
    
    @property
    def has_edit_business_comments(self):
        return self.is_active_member_of_business and self.can_edit_business_comments

    @property
    def has_do_dev_checklist(self):
        return self.is_active_member_of_business and self.can_do_dev_checklist

    @property
    def has_do_traffic_checklist(self):
        return self.is_active_member_of_business and self.can_do_traffic_checklist

    @property
    def has_do_finance_checklist(self):
        return self.is_active_member_of_business and self.can_do_finance_checklist

    @property
    def has_view_documents(self):
        return self.is_active_member_of_business and self.can_view_documents

    @property
    def has_view_calendar(self):
        return self.is_active_member_of_business and self.can_view_calendar

    @property
    def has_import_actual_hours(self):
        return self.is_active_member_of_business and self.can_import_actual_hours

    @property
    def has_edit_calendar(self):
        return self.is_active_member_of_business and self.can_edit_calendar

    @property
    def has_be_scheduled(self):
        return self.is_active_member_of_business and self.can_be_scheduled


class ProjectStatus(BaseModel):
    name = models.CharField(max_length=255, blank=True, null=True)
    business = models.ForeignKey(Business, related_name='project_statuses')

    class Meta:
        unique_together = (('name', 'business'), )

    def __unicode__(self):
        return self.name

    @classmethod
    def for_business(self, name, business):
        return ProjectStatus.objects.get_or_create(name=name, business=business)[0]

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(ProjectStatus, self).save(*args, **kwargs)
        affected_project_ids = [x.id for x in self.projects.all()]
        if was_created:
            RefreshNotifier().notify_model_create(
                self, params={'projects': affected_project_ids})
        else:
            RefreshNotifier().notify_model_update(
                self, params={'projects': affected_project_ids})


class ProjectQuerySet(QuerySet):
    def filter_by_logged_in_user(self, user):
        """ restricts entries to those belonging to projects the given
        user (typically the logged in user) is assigned to """
        return self.filter(business__in=BusinessPermissions.active_businesses_for_user(user))

    def order_by_business_id(self, business_id, descending=False, by_type_first=False):
        if business_id:
            orderings = []
            if by_type_first:
                orderings.append("project__project_type")
            orderings.append(("-" if descending else "") + "order")
            project_ids_in_order = BusinessProjectOrder.objects.filter(business_id=business_id)\
                                                          .order_by(*orderings)\
                                                          .values_list("project_id", flat=True)
            if project_ids_in_order.count() == 0:
                return self
            preserved = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(project_ids_in_order)])

            return self.order_by(preserved)
        else:
            return self

    def get_meta_info(self):
        sprints = self.prefetch_related("reviews")\
                      .prefetch_related("issues__entries")
        
        entries = Entry.objects.filter(issue__project__in=sprints,
                                       issue__issue_type__in=Issue.TESTABLE_ISSUE_TYPES)\
                               .filter(issue__assigned_to_id=F('user_id'))\
                               .order_by("issue__project_id")\
                               .values("issue__project_id").distinct()\
                               .annotate(hours_per_sprint=Sum('hours'))

        hours_per_sprint_by_assignee = dict( [(x['issue__project_id'], x['hours_per_sprint']) for x in entries] )

        issue_points = IssuePoints.objects.filter(issue__project__in=sprints,
                                                  issue__issue_type__in=Issue.TESTABLE_ISSUE_TYPES,
                                                  issue__assigned_to_id=F('user_id'))\
                                          .filter(issue__assigned_to_id=F('issue__project__rate__user_id'))\
                                          .order_by('issue__project', 'issue_id')\
                                          .values('issue__project', 'issue_id')\
                                          .annotate(points_per_issue=Sum(F('points')*F('issue__project__rate__velocity')))
        estimates_by_sprint_id = {}
        for k, v in itertools.groupby(issue_points, lambda x: x['issue__project']):
            estimates_by_sprint_id[k] = { 'num_estimated': 0,
                                          'estimated_hours': 0 }
            for estimated_issue in v:
                if estimated_issue['points_per_issue']:
                    estimates_by_sprint_id[k]['num_estimated'] += 1
                    estimates_by_sprint_id[k]['estimated_hours'] += estimated_issue['points_per_issue'] or 0


                
        # For this count we assume that only developer times matter,
        # and other times can be inferred.  This is logical if by
        # developer we mean 'person doing the assigned work' and other
        # time tracking roles are actually supporting that work (eg
        # management and testing).
        ASSIGNEE_TIME_TRACKING_MODE = 'developer'
        open_statuses = Issue.STATUSES_INDICATING_INCOMPLETE[ASSIGNEE_TIME_TRACKING_MODE]
        open_issue_points = issue_points.filter(issue__status2__name__in=open_statuses)
        for k, v in itertools.groupby(open_issue_points, lambda x: x['issue__project']):
            estimates_by_sprint_id[k]['num_open_estimated'] = 0
            estimates_by_sprint_id[k]['estimated_open_hours'] = 0
            for estimated_issue in v:
                if estimated_issue['points_per_issue']:
                    estimates_by_sprint_id[k]['num_open_estimated'] += 1
                    estimates_by_sprint_id[k]['estimated_open_hours'] += estimated_issue['points_per_issue'] or 0

        # For this count we want to know if the primary work has been
        # done, ie by the developer.
        DEV_CLOSED_TIME_TRACKING_MODE = 'developer'
        open_statuses = Issue.STATUSES_INDICATING_INCOMPLETE[DEV_CLOSED_TIME_TRACKING_MODE]
        closed_issues = Issue.objects.filter(project__in=sprints,
                                             issue_type__in=Issue.TESTABLE_ISSUE_TYPES)\
                                     .exclude(status2__name__in=open_statuses)\
                                     .order_by('project_id')\
                                     .values('project_id')\
                                     .annotate(num_closed=Count('id'))
        for num_closed_issues in closed_issues:
            estimates_by_sprint_id.setdefault(num_closed_issues['project_id'], {})['num_dev_closed_issues'] = num_closed_issues.get('num_closed', 0)
                    
        # For this count we assume the tester has the final word on
        # being closed.  Also we don't care about estimates for this count.
        COMPLETELY_CLOSED_TIME_TRACKING_MODE = 'tester'
        tester_open_statuses = Issue.STATUSES_INDICATING_INCOMPLETE[COMPLETELY_CLOSED_TIME_TRACKING_MODE]
        closed_issues = Issue.objects.filter(project__in=sprints,
                                             issue_type__in=Issue.TESTABLE_ISSUE_TYPES)\
                                     .exclude(status2__name__in=tester_open_statuses)\
                                     .order_by('project_id')\
                                     .values('project_id')\
                                     .annotate(num_closed=Count('id'))
        for num_closed_issues in closed_issues:
            estimates_by_sprint_id.setdefault(num_closed_issues['project_id'], {})['num_completely_closed_issues'] = num_closed_issues.get('num_closed', 0)

        testable_issues = Issue.objects.filter(project__in=sprints,
                                               issue_type__in=Issue.TESTABLE_ISSUE_TYPES)\
                                       .order_by('project_id')\
                                       .values('project_id')\
                                       .annotate(num_testable=Count('id'))
        for testable_issue_count in testable_issues:
            estimates_by_sprint_id.setdefault(testable_issue_count['project_id'], {})['num_testable_issues'] = testable_issue_count.get('num_testable', 0)

        num_issues_missing_testables_by_sprint = Issue.objects.filter(project__in=sprints,
                                                                      testables__isnull=True,
                                                                      issue_type__in=Issue.TESTABLE_ISSUE_TYPES)\
                                                              .order_by("project_id")\
                                                              .values("project_id")\
                                                              .annotate(num_missing_testables=Count("id"))
        for issues_missing_testable_count in num_issues_missing_testables_by_sprint:
            estimates_by_sprint_id.setdefault(issues_missing_testable_count['project_id'], {})['num_missing_testable_issues'] = issues_missing_testable_count.get('num_missing_testables', 0)

        num_unassigned_issues_by_sprint = Issue.objects.filter(project__in=sprints,
                                                               assigned_to_id__isnull=True)\
                                                       .order_by("project_id")\
                                                       .values("project_id")\
                                                       .annotate(num_unassigned=Count('id'))
        for num_assigned_issues in num_unassigned_issues_by_sprint:
            estimates_by_sprint_id.setdefault(num_assigned_issues['project_id'], {})['num_unassigned_issues'] = num_assigned_issues.get('num_unassigned', 0)


        for d in estimates_by_sprint_id.values():
            d["num_missing_estimates"] = d.get('num_testable_issues', 0) - d.get('num_estimated', 0)

        num_adhoc_issues_by_sprint = Issue.objects.filter(project__in=sprints,
                                                          issue_type__in=Issue.MANAGEMENT_ISSUE_TYPES)\
                                                  .order_by("project_id")\
                                                  .values("project_id")\
                                                  .annotate(num_adhoc=Count('id'))
        for num_adhoc_issues in num_adhoc_issues_by_sprint:
            estimates_by_sprint_id.setdefault(num_adhoc_issues['project_id'], {})['num_adhoc_issues'] = num_adhoc_issues.get('num_adhoc', 0)

        management_alert_statuses = Issue.STATUSES_INDICATING_MANAGER_ATTENTION
        management_alert_issues = Issue.objects.filter(project__in=sprints,
                                                       issue_type__in=Issue.TESTABLE_ISSUE_TYPES,
                                                       status2__name__in=management_alert_statuses)\
                                               .order_by('project_id')\
                                               .values('project_id')\
                                               .annotate(num_issues=Count('id'))
        for management_alert_issue in management_alert_issues:
            estimates_by_sprint_id.setdefault(management_alert_issue['project_id'], {})['num_management_alert_issues'] = management_alert_issue.get('num_issues', 0)

            
        risky_issues_by_sprint = Issue.objects.filter(project__in=sprints,
                                                      status2__name__in=open_statuses,
                                                      risky=True)\
                                              .order_by('project_id')\
                                              .values('project_id')\
                                              .annotate(num_issues=Count('id'))
        for risky_issues in risky_issues_by_sprint:
            estimates_by_sprint_id.setdefault(risky_issues['project_id'], {})['num_open_risky_issues'] = risky_issues.get('num_issues', 0)

        open_issues_needed = Issue.objects.filter(project__in=sprints,
                                                  needs_issues__status2__name__in=open_statuses)\
                                          .order_by('project_id')\
                                          .values('project_id')\
                                          .annotate(num_issues=Count('id'))
        for open_issue_needed in open_issues_needed:
            estimates_by_sprint_id.setdefault(open_issue_needed['project_id'], {})['num_open_issues_needed'] = open_issue_needed.get('num_issues', 0)

            
        return sprints, estimates_by_sprint_id, hours_per_sprint_by_assignee
        
        
    def filter_assigned_tasks_are_active(self):
        return self.filter(status3__name__in=['in dev', 'pending'],
                           project_type__in=['sprint', 'checklist', 'sprinkle', 'spec'])

    def filter_active(self):
        return self.filter(status3__name__in=Project.active_states())

    def filter_pending(self):
        return self.filter(status3__name__in=Project.pending_states())

    def filter_closed(self):
        return self.filter(status3__name__in=Project.closed_states())

    def filter_hopeful(self):
        return self.filter(status3__name__in=Project.hopeful_states())

    def filter_open(self):
        return self.exclude(status3__name__in=Project.closed_states())

    def filter_has_time(self):
        return self.exclude(status3__name__in=Project.closed_states())

    def filter_in_dev(self):
        return self.filter(status3__name='in dev')

    def filter_in_client_qa(self):
        return self.filter(status3__name='in client_qa')

    def filter_in_dev_or_pending(self):
        return self.filter(Q(status3__name='in dev')|Q(status3__name='pending'))

    def filter_can_add_dev_time_states(self):
        return self.filter(status3__name__in=Project.can_add_dev_time_states())

class ProjectRole(BaseModel):

    DEFAULT_PROJECT_ROLES = ( ('developer', 'developer'),
                              ('manager', 'manager'),
                              ('tester', 'tester') )
    
    business = models.ForeignKey(Business, related_name='roles')
    name = models.CharField(max_length=20, null=False)

    class Meta:
        unique_together = ('name', 'business')
    
    
class Project(BaseModel):

    PROJECT_STATUSES = ( ('gathering specs', 'gathering specs'),
                         ('quote sent', 'quote sent'),
                         ('pending', 'pending'),
                         ('hopeful', 'hopeful'),
                         ('in dev', 'in development'),
                         ('in client qa', 'in client qa'),
                         ('waiting to invoice', 'waiting to invoice'),
                         ('invoiced', 'invoiced'),
                         ('waiting to close', 'waiting to close'),
                         ('on hold', 'on hold'),
                         ('closed', 'closed') )

    PROJECT_TYPES = ( ('sprint', 'Sprint'),
                      ('minutes', 'Minutes'),
                      ('template', 'Template'),
                      ('checklist', 'Checklist'),
                      ('sprinkle', 'Sprinkle'),
                      ('backlog', 'Backlog'),
                      ('regression', 'Regression'),
                      ('audit', 'Audit'),
                      ('spec', 'Spec'),
                      ('inbox', 'Inbox') )

    CLOCKABLE_PROJECT_TYPES = [ "sprint", "spec", "minutes" ]

    REVIEW_SCHEDULE_PROJECT_TYPES = ["inbox"]
    
    code = models.CharField(max_length=255,blank=True,null=True)
    name = models.CharField(max_length=255, db_index=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tracker_url = models.CharField(max_length=255, blank=True, null=False,
        default="")
    business = models.ForeignKey(
        "Business",
        related_name='new_business_projects',
    )
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    billable = models.BooleanField(default=False)
    point_person = models.ForeignKey(User, limit_choices_to={'is_staff': True}, null=True)
    quote_uncertainty = models.FloatField(null=True, blank=True, default=0.25,
                                          verbose_name="Uncertainty overhead as a decimal between 0 and 1")
    project_type = models.CharField(max_length=20, null=False, choices=PROJECT_TYPES, default='sprint', db_index=True)
    number = models.IntegerField(null=False)
    users = models.ManyToManyField(
        User,
        related_name='user_projects',
        through='ProjectRelationship',
    )
    activity_group = models.ForeignKey(
        'ActivityGroup',
        related_name='activity_group',
        null=True,
        blank=True,
        verbose_name="restrict activities to",
    )

    type = models.ForeignKey(
        Attribute,
        limit_choices_to={'type': 'project-type'},
        related_name='projects_with_type',
        null=True
    )

    status3 = models.ForeignKey(ProjectStatus, related_name='projects', null=False)

    description = models.TextField(blank=True, null=True, db_index=True)
    short_description = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    objects = ProjectQuerySet.as_manager()
    interface_plugin_number = models.CharField(max_length=255, null=True, blank=True) #eg jira

    start_dev_at = models.DateField(null=True, blank=True)
    start_internal_qa_at = models.DateField(null=True, blank=True)
    start_client_qa_at = models.DateField(null=True, blank=True)
    invoice_at = models.DateField(null=True, blank=True) # this is for the final invoice for the sprint.

    ratio_management = models.FloatField(default=0.2, verbose_name="Ratio of management per develpment hour, between 0 and 1")
    ratio_testing = models.FloatField(default=0.2, verbose_name="Ratio of testing per development hour, between 0 and 1")
    ratio_scope_creep = models.FloatField(default=0.25, verbose_name="Ratio of additional issue hours added, between 0 and 1")
    commission_percentage = models.FloatField(default=0, verbose_name="Commission payable on the total billable amount")

    colour = RGBColorField(null=True, blank=True)

    @classmethod
    def get_or_create_project(self, business, project_name, description=None, short_description=None):
        description = "%s %s" % (project_name, (description or ""))
        point_person = User.objects.get_or_create(username="auto")[0]
        try:
            project_type = Attribute.objects.get(type='project-type', label='default')
        except:
            project_type = Attribute.objects.create(type='project-type', label='default', billable=True, enable_timetracking=True)

        try:
            project = Project.objects.get(name=project_name, business=business)
        except Project.DoesNotExist:
            project = Project.objects.create(name=project_name, business=business,
                                             point_person=point_person,
                                             status3=ProjectStatus.for_business('open', business),
                                             type=project_type,
                                             description=description,
                                             short_description=short_description)
        return project

    def move_after(self, other_project):
        BusinessProjectOrder.insert_after(self, other_project)

    @property
    def spendable_budget(self):
        return float(self.budget) * (1-float(self.commission_percentage)/100)

    def time_ratio_for_role(self, role_name):
        ratio_of_time = 1
        if role_name == 'manager':
            ratio_of_time = self.ratio_management
        elif role_name == 'tester':
            ratio_of_time = self.ratio_testing
        else:
            ratio_of_time = 1 - (self.ratio_testing+self.ratio_management)
        return ratio_of_time

    def estimated_budget_for_role(self, role_name, include_scope_creep=True):
        if not self.budget:
            return None

        if role_name == "commission":
            return float(self.budget) * float(self.commission_percentage)/100

        elif role_name in ["developer", "manager", "tester"]:
            if include_scope_creep:
                return self.new_stats['per_role'][role_name]['adjusted_points_non_management_core_rate']
            else:
                return self.new_stats['per_role'][role_name]['adjusted_points_non_management_core_rate_no_scope_creep']

        return None

    @property
    def issues_can_be_reviewed(self):
        return self.project_type != "inbox"

    def get_points(self):
        user_ids = [user.id for user in self.business.users]
        users = User.objects.filter(id__in = user_ids)
        for issue in self.issues.all():
            for user in users:
                try:
                    IssuePoints.objects.get(user=user,issue=issue)
                except IssuePoints.DoesNotExist:
                    IssuePoints.objects.create(user=user, issue=issue)

        distinct_user_qs = IssuePoints.objects.filter(user__id__in = user_ids).values_list("user").distinct()
        return [ (User.objects.get(pk=qs[0]), IssuePoints.objects.filter(user__id = qs[0]).order_by("issue")) for qs in distinct_user_qs]

    def get_points_total(self):
        ret = {}
        for user in self.users.all():
            total = user.user_points.filter(issue__project=self).aggregate(Sum("points"))
            ret[user] = total['points__sum'] if total['points__sum'] else 0
        return ret
    
    def model_to_dict(self, include_business=False):
        d = model_to_dict_with_date_support(self)
        if include_business:
            d['business'] = self.business.model_to_dict()

        del d['users']
        return d

    def recalc_secondary_estimates(self):
        """ these are estimates based on the developer estimates, for management and testing """

        project_users = BusinessPermissions._by_user(self.business)
        manager_users = []
        tester_users = []
        user_velocities = {}
        for user_id, bp in project_users.items():
            try:
                rate = Rate.objects.get_or_create(project=self, user_id=user_id)[0]
                time_tracking_mode = rate.time_tracking_mode
                user_velocities[user_id] = rate.velocity
            except Rate.MultipleObjectsReturned:
                time_tracking_mode = 'developer'
                user_velocities[user_id] = 1
            if time_tracking_mode == 'manager':
                manager_users.append([user_id, bp, User.objects.get(pk=user_id)])
            elif time_tracking_mode == 'tester':
                tester_users.append([user_id, bp, User.objects.get(pk=user_id)])

        if manager_users:
            for issue in self.issues.all():
                estimate, assigned_to = issue.get_assigned_hours_estimate()
                estimate *= (user_velocities[assigned_to.id] if assigned_to else 1) * self.ratio_management
                if estimate < 0.1:
                    estimate = 0.1
                else:
                    estimate = round(estimate, 2)
                for user_id, bp, user in manager_users:
                    issue.set_points(user=user, points=estimate)
        if tester_users:
            for issue in self.issues.all():
                estimate, assigned_to = issue.get_assigned_hours_estimate()
                estimate *= (user_velocities[assigned_to.id] if assigned_to else 1) * self.ratio_testing
                if estimate < 0.1:
                    estimate = 0.0
                else:
                    estimate = round(estimate, 2)
                for user_id, bp, user in tester_users:
                    issue.set_points(user=user, points=estimate)

    def min_estimate_hours(self):
        return self.estimate_stats()['total_estimate_hours_min']

    def max_estimate_hours(self):
        return self.estimate_stats()['total_estimate_hours_max']

    def typical_estimate_hours(self):
        return self.estimate_stats()['total_estimate_hours_max']

    def role_for_user(self, user):
        rate = Rate.objects.filter(user=user, project=self).first()
        if not rate:
            return None
        return rate.time_tracking_mode

    def get_default_issue_for_type(self, user, issue_type, subject, description):
        return Issue.objects.get_or_create(subject=subject,
                                           project=self,
                                           assigned_to=user,
                                           issue_type=issue_type,
                                           defaults={'status2':IssueStatus.objects.get_or_create(name='new', business=self.business)[0],
                                                     'number':Issue.get_next_issue_number(self.business),
                                                     'description':description})[0]

    
    @property
    def scheduled_events(self):
        return self.calendar_events.all().filter(Q(event_type='planned')|Q(event_type='meeting'))

    def scheduled_hours(self):
        return self.scheduled_events.aggregate(hours=Sum('hours'))['hours']

    def min_unscheduled_hours(self):
        return float(self.min_estimate_hours() or 0) - float(self.scheduled_hours() or 0)

    def max_unscheduled_hours(self):
        return float(self.max_estimate_hours() or 0) - float(self.scheduled_hours() or 0)

    def scheduled_hours_percentage(self):
        return (float(self.scheduled_hours()) / (float(self.typical_estimate_hours()) or 1))*100

    def scheduled_hours_per_user(self):
        return [ { 'user': User.objects.get(pk=x['user']), 'hours': x['hours'] } for x in self.scheduled_events.values('user').annotate(hours=Sum('hours')) ]

    def scheduled_to_start_at(self):
        try:
            return self.scheduled_events.order_by("start")[0].start
        except IndexError:
            return None

    def scheduled_to_end_at(self):
        try:
            return self.scheduled_events.order_by("-start")[0].start
        except IndexError:
            return None

    def get_rates_by_user(self):
        return dict( [ (x['user'],
                        { 'ctc_amount': float(x['amount'] or 0),
                          'billable_amount': float(x['billable_amount'] or 0),
                          'velocity': float(x['velocity']) or 1,
                        })
                        for x in Rate.objects.filter(project=self).values('user', 'amount', 'billable_amount', 'velocity') ] )

    def get_user_rate(self, user):

        if isinstance(user, basestring):
            user = User.objects.get(username=user)

        try:
            return Rate.objects.get(project=self, user=user)
        except Rate.DoesNotExist:
            if user in self.users.all():
                return Rate.objects.create(project=self, user=user)
            return None
        except Rate.MultipleObjectsReturned:
            qs = Rate.objects.filter(project=self, user=user).order_by("user__id")
            rate = qs.first()
            qs.exclude(pk=rate.id).delete()
            return rate

    def __init__(self, *args, **kwargs):
        super(Project, self).__init__(*args, **kwargs)
        self._stats = None
        self._estimate_stats = None
        self._users_and_hours = None
        self._new_stats = None
        self._new_stats_summary = None

    @property
    def has_budget(self):
        return self.budget>0

    @property
    def next_issue_number(self):
        return Issue.objects.filter(project__business=self.business).aggregate(n=Max('number'))['n']+1

    @classmethod
    def get_project_from_name(self, name, business):
        project_id = None
        match_object = re.compile("[sS]print#?(\d+).*").search(name)
        if match_object and match_object.groups() != 0:
            project_id = int(match_object.group(1))
            return Project.objects.get(business=business, pk=project_id)
        else:
            code = Project.get_code_from_name(name)
            return Project.objects.get(business=business, code=code)

    @classmethod
    def get_code_from_name(self, name):

        """ Try to use the project id """
        project_id = None
        match_object = re.compile("[sS]print#(\d+).*").search(name)
        if match_object and match_object.groups() != 0:
            project_id = int(match_object.group(1))
            return Project.objects.get(pk=project_id).code

        new_name = "".join(name.split())
        new_name = new_name.strip()
        new_name = new_name.replace(":NEXT:","")
        new_name = new_name.replace("STARTED","")
        new_name = new_name.replace("DONE","")
        new_name = new_name.replace("OPEN","")
        new_name = new_name.replace("PAID","")
        new_name = new_name.replace("INVOICE","")
        new_name = new_name.replace("INVOICED","")
        new_name = new_name.lower()

        replacement = lambda matches: "".join(['_' for i in matches.groups()])
        new_name = re_sub(r"(\W{1})", replacement, new_name)
        new_name = new_name.replace("_","")

        return new_name

    @classmethod
    def get_last_project_number(self, business):
        largest_number =  Project.objects.filter(business=business).filter(number__isnull=False).aggregate(largest_number=Max("number"))['largest_number']
        return largest_number or 0

    @classmethod
    def get_next_project_number(self, business):
        return Project.get_last_project_number(business) + 1

    def save(self, *args, **kwargs):

        self.code = Project.get_code_from_name(self.name)

        if not self.id:
            duplicate_projects = Project.objects.filter(business=self.business)
            while duplicate_projects.filter(code=self.code).exists():
                self.code = self.code + "_d"
        new_project = self.id is None

        if self.number is None or self.number == -1:
            self.number = Project.get_next_project_number(self.business)


        super(Project, self).save(*args, **kwargs)
        params = { 'project_id': self.business_id }
        if new_project:
            self._sync_from_previous_project()
            RefreshNotifier().notify_model_create(self, params)
        else:
            RefreshNotifier().notify_model_update(self, params)


    @property
    def previous_project(self):
        qs = self.business.get_ordered_projects().exclude(id=self.id)
        project = qs.exclude(status3__name='closed').first()
        if not project:
            project = qs.first()
        return project

    def _sync_from_previous_project(self):
        """ Add all users from other projects in this business """

        users = User.objects.filter(user_projects__business=self.business).distinct()
        for user in users:
            ProjectRelationship.objects.get_or_create(user=user, project=self)
            UserProfile.objects.get_or_create(user=user)
            user.save()

        previous_project = self.previous_project
        previous_rates = Rate.objects.filter(project=previous_project).distinct('user')
        user_ids_with_rates = []
        if previous_project:
            for previous_rate in previous_rates:
                rate = Rate(project=self,
                            user=previous_rate.user,
                            amount = previous_rate.amount,
                            billable_amount = previous_rate.billable_amount,
                            velocity = previous_rate.velocity,
                            work_ratio=previous_rate.work_ratio,
                            time_tracking_mode = previous_rate.time_tracking_mode)
                rate.save(recalc_secondary_estimates=False)
                user_ids_with_rates.append(previous_rate.user.id)

        for user in users.exclude(pk__in=user_ids_with_rates):
            rate = Rate(project=self, user=user, amount=user.profile.amount,
                        billable_amount=user.profile.billable_amount,
                        velocity=1)
            rate.save(recalc_secondary_estimates=False)

    @classmethod
    def projects_in_desc_order_of_use(self, business_id):
        entries = Entry.objects.filter(issue__project__business_id=business_id).order_by('-end_time').values('project_id')
        p = OrderedDict()
        for entry in entries:
            if entry['project_id'] not in p:
                p[entry['project_id']] = Project.objects.get(pk=entry['project_id'])
        return p.values()

    @classmethod
    def most_recent_project(self, business_id):
        entries_per_business_ids = Entry.objects.filter(issue__project__business_id=business_id).order_by('-end_time').values('issue__project_id')
        project_returned = None

        if len(entries_per_business_ids) != 0:
            project_id = entries_per_business_ids[0]['issue__project_id']

            try:
                project_returned = Project.objects.get(pk=project_id)
            except Project.DoesNotExist:
                project_returned = None

        if not project_returned:
            qs = Project.objects.filter(business__id=business_id).order_by("-id")
            project_returned = qs[0] if len(qs) > 0 else None

        return project_returned

    def close(self):
        self.status3 = ProjectStatus.objects.get_or_create(name='closed', business=self.business)[0]
        self.save()

    def open(self):
        self.status3 = ProjectStatus.objects.get_or_create(name='pending', business=self.business)[0]
        self.save()

    def delete():
        super(Project, self).delete(*args, **kwargs)
        
    @classmethod
    def active_states(self):
        return ( 'open', 'in dev', 'in development', 'waiting to invoice', 'invoiced', 'in client qa' )

    @classmethod
    def pending_states(self):
        return ( 'pending', 'quote sent', 'gathering specs' )

    @classmethod
    def closed_states(self):
        return ( 'closed', 'waiting to close', 'on hold' )

    @classmethod
    def hopeful_states(self):
        return ( 'gathering specs', 'on hold', 'hopeful' )

    @classmethod
    def open_states(self):
        return self.hopeful_states() + self.pending_states() + self.active_states()

    @classmethod
    def can_add_dev_time_states(self):
        return ( 'open', 'hopeful', 'pending', 'in dev', 'in client qa', 'gathering specs', 'quote sent' )

    def can_add_dev_time(self):
        return self.status3.name in self.can_add_dev_time_states()

    @property
    def is_open(self):
        if self.status3 and self.status3.name in self.closed_states():
            return False
        return True

    def estimate_stats(self, issues=None, preferred_user_id=None):

        if preferred_user_id is None:
            try:
                preferred_user_id = BusinessPermissions.by_user(self.business).keys()[0]
            except:
                raise Exception("No preferred user selected. If there is no preferred user in the report list, then ensure at least one user has the permission 'can estimate own points'")

        if self._estimate_stats is not None:
            return self._estimate_stats
        if issues is None:
            issues = self.issues.all()
        stats = {'issues':[], 'users':{}}
        self._estimate_stats = stats

        total_estimated_hours = 0
        estimated_management_cost = 0
        estimated_testing_cost = 0
        dev_estimate_cost = 0
        dev_estimate_hours = 0
        estimated_management_cost = 0
        estimated_testing_cost = 0

        def _calculate_user_contribution_to_issue_cost(issue, user_id, points):
            if user_id is not None:
                rate = Rate.objects.filter(project=self, user_id=user_id).first()
                if rate is None:
                    rate = Rate.objects.create(project=self, user_id=user_id, amount=0)
            else:
                rate = Rate(velocity=0, amount=0)

            unadjusted_points = points
            points = float(points or 0) * (rate.full_velocity or 1)

            estimated_cost = float(points)*rate.full_rate

            if estimated_cost > 0:
                # If there's an estimate, then ignore the actuals
                actual_cost_so_far = 0
            else:
                # For no estimate, this is most likely an ad-hoc issue, so put the time in as part of the quote
                actual_cost_so_far = float(issue.entries.all().filter(user_id=user_id).aggregate(hours=Sum('hours'))['hours'] or 0) * rate.full_rate

            min_cost = estimated_cost + actual_cost_so_far

            if issue.is_fixed_cost():
                min_cost += float(issue.fixed_amount)

            return points, unadjusted_points, min_cost, rate

        if issues is not None and issues.count() > 0:

            managers = [x.user for x in Rate.objects.filter(project=self, time_tracking_mode='manager')]
            testers = [x.user for x in Rate.objects.filter(project=self, time_tracking_mode='tester')]

            for issue in issues:

                points = []
                if issue.assigned_to:
                    points = issue.issue_points.all().filter(user=issue.assigned_to).values('points', 'user')
                    user_id = issue.assigned_to.id
                elif preferred_user_id:
                    points = issue.issue_points.all().filter(user__id=preferred_user_id).values('points', 'user')
                    user_id = preferred_user_id
                else:
                    points = issue.issue_points.all().values('points', 'user')
                    user_id = None

                if len(points) == 0 or points[0]['points'] is None:
                    points = 0
                else:
                    user_id = points[0]['user']
                    points = points[0]['points']

                points, unadjusted_points, min_cost, rate = _calculate_user_contribution_to_issue_cost(issue, user_id, points)

                issue_data = { 'issue':issue,
                               'unadjusted_points':unadjusted_points,
                               'points':points,
                               'user_id':user_id,
                               'min_cost':min_cost,
                               'combined_cost':min_cost}
                stats['issues'].append( issue_data )

                if user_id is not None and user_id not in stats['users']:
                    user = User.objects.get(pk=user_id)
                    stats['users'][user_id] = {'user':user,
                                               'rate':rate.full_rate,
                                               'velocity_adjusted_rate':float(rate.full_velocity)*float(rate.full_rate)}

                dev_estimate_cost += min_cost
                dev_estimate_hours += points

                if issue.issue_type not in Issue.MANAGEMENT_ISSUE_TYPES:
                    for manager in managers:
                        user_id = manager.id
                        try:
                            points = issue.issue_points.all().filter(user=manager).values('points')[0]['points']
                            manager_points, unadjusted_points, manager_cost, rate = _calculate_user_contribution_to_issue_cost(issue, user_id, points)
                            estimated_management_cost += manager_cost
                            issue_data['combined_cost'] += manager_cost

                        except IndexError:
                            pass

                    for tester in testers:
                        user_id = tester.id
                        try:
                            points = issue.issue_points.all().filter(user=tester).values('points')[0]['points']
                            tester_points, unadjusted_points, tester_cost, rate = _calculate_user_contribution_to_issue_cost(issue, user_id, points)
                            estimated_testing_cost += tester_cost
                            issue_data['combined_cost'] += tester_cost
                        except IndexError:
                            pass


                total_estimated_hours += points or 0
                issue_data['combined_cost_with_scope_creep'] = issue_data['combined_cost']

        stats['total_estimate_min'] = dev_estimate_cost + estimated_management_cost + estimated_testing_cost
        stats['total_estimate_max'] = stats['total_estimate_min']
        stats['dev_estimate_cost'] = dev_estimate_cost
        stats['management_estimate_cost'] = estimated_management_cost
        stats['testing_estimate_cost'] = estimated_testing_cost
        stats['ratio_scope_creep'] = self.ratio_scope_creep*100
        stats['total_estimate_hours_min'] = total_estimated_hours
        stats['total_estimate_hours_max'] = total_estimated_hours
        return stats

    def users_and_hours(self):
        return self._get_users_and_hours({'entries':Entry.objects.filter(issue__project=self)})

    @property
    def new_stats(self):
        if self._new_stats is None:
            raise Exception("Must call calculate_new_stats first")
        return self._new_stats

    def calculate_new_stats(self, current_user):
        if self._new_stats is not None:
            return self._new_stats

        if not self.id or not self.business:
            return None

        entries_for_project = Entry.objects.filter(issue__project=self)
        stats_per_user = {}

        stats_per_role = {}
        for mode in TIME_TRACKING_MODES:
            stats_per_role[mode] = { 'hours':0, 'hours_billable':0, 'points_calculated_open_non_management_billable': 0,
                                     'points_calculated_open_non_management_billable_core_rate': 0,
                                     'per_user': {},
                                     'average_rate': {},
                                     'hours_billable_core_rate': 0,
                                     'adjusted_points_non_management_core_rate': 0,
                                     'adjusted_points_non_management_core_rate_no_scope_creep': 0,
                                     'users_in_role': [],
                                     'projected_billable': 0, 'points_estimated_open_non_management_billable':0,
                                     'projected_estimated_billable':0,
                                     'adjusted_points_billable':0 }

        users = self.business.get_users_allowed_to_estimate_on_business(current_user)

        def _get_total(res):
            try:
                return res[0]['total']
            except:
                return 0

        for user in users:
            entries = entries_for_project.filter(user=user)

            stats_per_user[user] = {}
            rate = Rate.objects.filter(project=self, user=user).first() or Rate(project=self, user=user, amount=0, billable_amount=0, velocity=1)
            stats_per_user[user]['rate'] = rate

            if rate.time_tracking_mode == 'developer':
                issue_points = IssuePoints.objects.filter(issue__project=self, issue__assigned_to=user, user=user).distinct()
            else:
                issue_points = IssuePoints.objects.filter(issue__project=self, user=user).distinct()
            issue_points_comparative = IssuePoints.objects.filter(issue__project=self, user=user).distinct()

            open_status_options = Issue.STATUSES_INDICATING_INCOMPLETE[rate.time_tracking_mode]

            stats_per_user[user]['points_non_management'] = _get_total(issue_points.exclude(issue__issue_type__in=Issue.MANAGEMENT_ISSUE_TYPES)\
                                                                       .values('user')\
                                                                       .annotate(total=Sum('points')))
            stats_per_user[user]['open_status_options'] = sorted(open_status_options)

            stats_per_user[user]['points_closed_non_management'] = _get_total(issue_points.exclude(issue__status2__name__in=open_status_options)\
                                                                              .exclude(issue__issue_type__in=Issue.MANAGEMENT_ISSUE_TYPES)\
                                                                              .values('user')\
                                                                              .annotate(total=Sum('points')))
            stats_per_user[user]['points_closed'] = _get_total(issue_points.exclude(issue__status2__name__in=open_status_options)\
                                                               .values('user').annotate(total=Sum('points')))
            stats_per_user[user]['points_open_non_management'] = _get_total(issue_points.filter(issue__status2__name__in=open_status_options)\
                                                                            .exclude(issue__issue_type__in=Issue.MANAGEMENT_ISSUE_TYPES)\
                                                                            .values('user')\
                                                                            .annotate(total=Sum('points')))

            stats_per_user[user]['adjusted_points_open_non_management_no_scope_creep'] = (stats_per_user[user]['points_open_non_management'] or 0) * (stats_per_user[user]['rate'].velocity or 0)

            stats_per_user[user]['adjusted_points_non_management'] = (stats_per_user[user]['points_non_management'] or 0) * (stats_per_user[user]['rate'].full_velocity or 0)
            stats_per_user[user]['adjusted_points_non_management_no_scope_creep'] = (stats_per_user[user]['points_non_management'] or 0) * (stats_per_user[user]['rate'].velocity or 0)

            stats_per_user[user]['adjusted_points_ctc'] = stats_per_user[user]['adjusted_points_non_management'] * float(stats_per_user[user]['rate'].amount)
            stats_per_user[user]['adjusted_points_billable'] = stats_per_user[user]['adjusted_points_non_management'] * float(stats_per_user[user]['rate'].full_rate)

            stats_per_user[user]['unadjusted_points_billable_core_rate_no_scope_creep'] = \
              (stats_per_user[user]['points_non_management'] or 0) * \
              (stats_per_user[user]['rate'].velocity or 0) * \
              float(stats_per_user[user]['rate'].billable_amount or 0)

            stats_per_user[user]['unadjusted_points_billable_core_rate'] = \
              (stats_per_user[user]['points_non_management'] or 0) * \
              (stats_per_user[user]['rate'].full_velocity or 0) * \
              float(stats_per_user[user]['rate'].billable_amount or 0)


            stats_per_user[user]['points_comparative_non_management'] = _get_total(issue_points_comparative\
                                                                                   .exclude(issue__issue_type__in=Issue.MANAGEMENT_ISSUE_TYPES)\
                                                                                   .values('user')\
                                                                                   .annotate(total=Sum('points')))
            stats_per_user[user]['points_comparative_closed_non_management'] = _get_total(issue_points_comparative.exclude(issue__status2__name__in=open_status_options)\
                                                                                     .exclude(issue__issue_type__in=Issue.MANAGEMENT_ISSUE_TYPES)\
                                                                                     .values('user').annotate(total=Sum('points')))
            stats_per_user[user]['points_comparative_open_non_management'] = _get_total(issue_points_comparative\
                                                                                   .filter(issue__status2__name__in=open_status_options)\
                                                                                   .exclude(issue__issue_type__in=Issue.MANAGEMENT_ISSUE_TYPES)\
                                                                                   .values('user').annotate(total=Sum('points')))

            stats_per_user[user]['adjusted_points_comparative_non_management'] = (stats_per_user[user]['points_comparative_non_management'] or 0) * (stats_per_user[user]['rate'].full_velocity or 0)

            stats_per_user[user]['adjusted_points_comparative_ctc'] = stats_per_user[user]['adjusted_points_comparative_non_management'] * float(stats_per_user[user]['rate'].amount)
            stats_per_user[user]['adjusted_points_comparative_billable'] = stats_per_user[user]['adjusted_points_comparative_non_management'] * float(stats_per_user[user]['rate'].full_rate)

            stats_per_user[user]['hours'] = _get_total(entries.order_by('user').values('user').annotate(total=Sum('hours')))

            stats_per_user[user]['hours_for_role'] = _get_total(entries.values('user').annotate(total=Sum('hours')))

            stats_per_user[user]['hours_real'] = _get_total(entries.exclude(issue__issue_type__in=Issue.MANAGEMENT_ISSUE_TYPES)\
                                                            .order_by('user')\
                                                            .values('user')\
                                                            .annotate(total=Sum('hours')))
            stats_per_user[user]['hours_closed'] = _get_total(entries.exclude(issue__status2__name__in=open_status_options).order_by('user').values('user').annotate(total=Sum('hours')))
            stats_per_user[user]['hours_closed_real'] = _get_total(entries.exclude(issue__issue_type__in=Issue.MANAGEMENT_ISSUE_TYPES)\
                                                                   .exclude(issue__status2__name__in=open_status_options)\
                                                                   .order_by('user')\
                                                                   .values('user')\
                                                                   .annotate(total=Sum('hours')))
            stats_per_user[user]['hours_adhoc'] = _get_total(entries.filter(issue__issue_type__in=Issue.MANAGEMENT_ISSUE_TYPES)\
                                                             .order_by('user')\
                                                             .values('user')\
                                                             .annotate(total=Sum('hours')))

            stats_per_user[user]['hours_ctc'] = stats_per_user[user]['rate'].amount * stats_per_user[user]['hours']
            stats_per_user[user]['hours_billable'] = stats_per_user[user]['rate'].full_rate * float(stats_per_user[user]['hours'])

            stats_per_user[user]['hours_billable_core_rate'] = float(stats_per_user[user]['rate'].billable_amount) * float(stats_per_user[user]['hours'])
            stats_per_user[user]['hours_for_role_billable_core_rate'] = float(stats_per_user[user]['rate'].billable_amount) * float(stats_per_user[user]['hours_for_role'])
            stats_per_user[user]['hours_real_billable'] = stats_per_user[user]['rate'].full_rate * float(stats_per_user[user]['hours_real'])
            stats_per_user[user]['hours_adhoc_billable'] = stats_per_user[user]['rate'].full_rate * float(stats_per_user[user]['hours_adhoc'])

            if rate.time_tracking_mode in TIME_TRACKING_MODES_WITHOUT_VELOCITY:
                stats_per_user[user]['calculated_velocity'] = 1
            else:
                stats_per_user[user]['calculated_velocity'] = (float(stats_per_user[user]['hours_for_role']) or 0) / float((stats_per_user[user]['points_closed'] or 1))
            # if stats_per_user[user]['hours_closed_real']:
            #     #stats_per_user[user]['calculated_velocity'] = (float(stats_per_user[user]['hours_closed_real']) or 0) / float((stats_per_user[user]['points_closed_non_management'] or 1))

            # else:
            #     stats_per_user[user]['calculated_velocity'] = 1
            stats_per_user[user]['calculated_work_ratio'] = 1 # to be fixed (float(stats_per_user[user]['hours_adhoc']) or 0.0) / (float((stats_per_user[user]['hours'] or 1)))

            stats_per_user[user]['points_calculated_open_non_management'] = (stats_per_user[user]['points_open_non_management'] or 0) * (stats_per_user[user]['calculated_velocity'] or 1)
            stats_per_user[user]['points_calculated_open_non_management_ctc'] = float(stats_per_user[user]['rate'].amount) * (stats_per_user[user]['points_calculated_open_non_management'] or 0)
            stats_per_user[user]['points_calculated_open_non_management_billable'] = float(stats_per_user[user]['rate'].full_rate) * (stats_per_user[user]['points_calculated_open_non_management'] or 0)

            stats_per_user[user]['adjusted_points_non_management_core_rate'] = float(stats_per_user[user]['rate'].billable_amount) * (stats_per_user[user]['adjusted_points_non_management'] or 0)
            stats_per_user[user]['adjusted_points_non_management_core_rate_no_scope_creep'] = float(stats_per_user[user]['rate'].billable_amount) * (stats_per_user[user]['adjusted_points_non_management_no_scope_creep'] or 0)
            stats_per_user[user]['points_calculated_open_non_management_billable_core_rate'] = float(stats_per_user[user]['rate'].billable_amount) * (stats_per_user[user]['points_calculated_open_non_management'] or 0)

            stats_per_user[user]['points_estimated_open_non_management'] = (stats_per_user[user]['points_open_non_management'] or 0) * (stats_per_user[user]['rate'].full_velocity or 1)
            stats_per_user[user]['points_estimated_open_non_management_ctc'] = float(stats_per_user[user]['rate'].amount) * (stats_per_user[user]['points_estimated_open_non_management'] or 0)
            stats_per_user[user]['points_estimated_open_non_management_billable'] = float(stats_per_user[user]['rate'].full_rate) * (stats_per_user[user]['points_estimated_open_non_management'] or 0)

            stats_per_user[user]['percentage_points_complete'] = float(stats_per_user[user]['points_closed_non_management'] or 0) / float(stats_per_user[user]['points_non_management'] or 1) * 100

            stats_per_role[rate.time_tracking_mode]['adjusted_points_non_management_core_rate'] += stats_per_user[user]['adjusted_points_non_management_core_rate']
            stats_per_role[rate.time_tracking_mode]['adjusted_points_non_management_core_rate_no_scope_creep'] += stats_per_user[user]['adjusted_points_non_management_core_rate_no_scope_creep']
            stats_per_role[rate.time_tracking_mode]['users_in_role'].append(user)

        for user in users:

            entries_for_user = entries_for_project.filter(user=user)
            rate = Rate.objects.filter(project=self, user=user).first() or Rate(project=self, user=user, amount=0, billable_amount=0, velocity=1)

            for role in TIME_TRACKING_MODES:
                entries_for_role = entries_for_user
                hours = entries_for_role.values('user_id').aggregate(hours=Sum('hours'))['hours']
                if hours is None:
                    continue
                hours = float(hours)

                stats_per_role[role]['hours'] += hours
                stats_per_role[role]['hours_billable'] += hours * float(rate.full_rate)
                stats_per_role[role]['per_user'][user] = { 'hours_billable_core_rate' : hours * float(rate.billable_amount) }
                stats_per_role[role]['hours_billable_core_rate'] += stats_per_role[role]['per_user'][user]['hours_billable_core_rate']

        total_stats = {}

        total_stats['points_billable'] = sum(stats_per_user[x]['adjusted_points_billable'] or 0 for x in users)
        total_stats['points_comparative_billable'] = sum(stats_per_user[x]['adjusted_points_comparative_billable'] or 0 for x in users)
        total_stats['points_non_management'] = sum(stats_per_user[x]['points_non_management'] or 0 for x in users)
        total_stats['points_closed_non_management'] = sum(stats_per_user[x]['points_closed_non_management'] or 0 for x in users)
        total_stats['hours'] = sum(stats_per_user[x]['hours'] or 0 for x in users)
        total_stats['hours_real'] = sum(stats_per_user[x]['hours_real'] or 0 for x in users)
        total_stats['hours_closed_real'] = sum(stats_per_user[x]['hours_closed_real'] or 0 for x in users)
        total_stats['hours_adhoc'] = sum(stats_per_user[x]['hours_adhoc'] or 0 for x in users)

        ctc_and_billable_totals = self.get_ctc_and_billable_totals()
        total_stats['hours_ctc'] = sum(stats_per_user[x]['hours_ctc'] or 0 for x in users) + ctc_and_billable_totals['fixed_ctc_total']
        total_stats['hours_billable'] = sum(stats_per_user[x]['hours_billable'] or 0 for x in users) + ctc_and_billable_totals['fixed_amount_total']

        total_stats['hours_billable_core_rate'] = sum( [ stats_per_user[x]['hours_billable_core_rate'] or 0 for x in users ] ) + ctc_and_billable_totals['fixed_amount_total']
        total_stats['hours_real_billable'] = sum( [ stats_per_user[x]['hours_real_billable'] or 0 for x in users ] )

        total_stats['hours_billable_with_scope_creep'] = float(total_stats['points_billable'])
        total_stats['scope_creep_percentage'] = self.ratio_scope_creep*100
        total_stats['hours_adhoc_billable'] = sum(stats_per_user[x]['hours_adhoc_billable'] or 0 for x in users)
        total_stats['points_calculated_open_non_management_ctc'] = sum(stats_per_user[x]['points_calculated_open_non_management_ctc'] or 0 for x in users)
        total_stats['points_calculated_open_non_management_billable'] = sum(stats_per_user[x]['points_calculated_open_non_management_billable'] or 0 for x in users)
        total_stats['points_estimated_open_non_management_ctc'] = sum(stats_per_user[x]['points_estimated_open_non_management_ctc'] or 0 for x in users)
        total_stats['points_estimated_open_non_management_billable'] = sum(stats_per_user[x]['points_estimated_open_non_management_billable'] or 0 for x in users)
        total_stats['unadjusted_points_billable_core_rate'] = sum(stats_per_user[x]['unadjusted_points_billable_core_rate'] or 0 for x in users)
        total_stats['unadjusted_points_billable_core_rate_no_scope_creep'] = sum(stats_per_user[x]['unadjusted_points_billable_core_rate_no_scope_creep'] or 0 for x in users)
        total_stats['adjusted_points_open_non_management_no_scope_creep'] = sum(stats_per_user[x]['adjusted_points_open_non_management_no_scope_creep'] or 0 for x in users)

        total_stats['percentage_points_complete'] = (total_stats['points_closed_non_management'] or 0) / (total_stats['points_non_management'] or 1) * 100


        total_stats['projected_total_billable_no_more_adhoc'] = float(total_stats['points_calculated_open_non_management_billable']) + float(total_stats['hours_billable'])
        total_stats['projected_total_billable_no_more_adhoc_with_scope_creep'] = float(total_stats['projected_total_billable_no_more_adhoc'])

        total_stats['projected_adhoc_billable'] = 1/(total_stats['percentage_points_complete']/100 or 1) * (float(total_stats['hours_adhoc_billable'] or 0)) - (float(total_stats['hours_adhoc_billable'] or 0))
        total_stats['projected_total_billable'] = float(total_stats['points_calculated_open_non_management_billable']) + float(total_stats['hours_billable'])
        total_stats['projected_total_billable_with_scope_creep'] = total_stats['projected_total_billable']

        total_stats['projected_estimated_total_billable'] = float(total_stats['points_estimated_open_non_management_billable']) + float(total_stats['hours_billable'])
        total_stats['projected_estimated_total_billable'] = float(total_stats['points_estimated_open_non_management_billable']) + float(total_stats['hours_billable'])

        total_stats['management_points_non_management'] = total_stats['points_non_management'] * self.ratio_management
        total_stats['testing_points_non_management'] = total_stats['points_non_management'] * self.ratio_testing

        total_stats['total_quote_cost'] = float(total_stats['hours_billable_with_scope_creep'])

        for role_name, role_stat in stats_per_role.items():
            role_stat['percentage_of_total_hours'] = float(role_stat['hours'] or 0.0) / float(total_stats['hours'] or 1) * 100
            role_stat['percentage_of_total_hours_billable'] = float(role_stat['hours_billable'] or 0.0) / float(total_stats['hours_billable'] or 1) * 100

            positive_rates = [x for x in role_stat['users_in_role'] if stats_per_user[x]['rate'].full_rate > 0]
            role_stat['average_billable_rate'] = sum([stats_per_user[x]['rate'].full_rate for x in positive_rates])/len(positive_rates)\
                                                   if len(positive_rates)>0 else 0

        self._new_stats = {'per_user': stats_per_user,
                           'per_role': stats_per_role,
                           'total': total_stats}

        return self._new_stats

    def prepare_stats_for_json(self, user):
        stats = self.calculate_new_stats(user)
        json_stats = {}
        json_stats['sprint_id'] = self.pk
        json_stats['budget'] = int(round(self.budget) or 0)
        json_stats['internal_commision'] = int(round(self.estimated_budget_for_role("commission") or 0))
        json_stats['spendable_budget'] = int(round(self.spendable_budget  or 0))

        total = stats['total']
        json_stats['estimated_cost'] = int(round(total['unadjusted_points_billable_core_rate'] or 0))
        if self.spendable_budget > total['unadjusted_points_billable_core_rate']:
            json_stats['spendable_budget_msg'] = 'This is less than the spendable budget'
        else:
            json_stats['spendable_budget_msg'] = 'This is more than the spendable budget'

        json_stats['spent'] = int(round(total['hours_billable_core_rate'] or 0))
        json_stats['progress_against_budget'] = (float(total['hours_billable_core_rate'] or 0) / float(self.budget)) if self.budget else 0

        if self.has_budget and self.stats['amount_under_budget'] > 0:
            json_stats['budget_status'] = 'R%s under budget' %(round(self.stats['amount_under_budget'] or 0, 2))
            json_stats['under_budget'] = True
        elif self.has_budget:
            json_stats['budget_status'] = 'R%s over budget' %(round(self.stats['amount_over_budget'] or 0, 2))
            json_stats['under_budget'] = False
        else:
            json_stats['budget_status'] = 'No budget'
            json_stats['under_budget'] = False

        per_role = stats['per_role']
        json_stats['per_role'] = {}
        for role_name, data in sorted(per_role.iteritems()):
            budget = int(round(self.estimated_budget_for_role(role_name) or 0))
            budget_without_scope_creep = int(round(self.estimated_budget_for_role\
                                                   (role_name, include_scope_creep=False) or 0))
            hours_billable_core_rate = int(round(data['hours_billable_core_rate'] or 0))

            json_stats['per_role'][role_name] = {}
            json_stats['per_role'][role_name]['budget'] = budget
            json_stats['per_role'][role_name]['ratio_scope_creep'] = self.ratio_scope_creep * 100
            json_stats['per_role'][role_name]['budget_without_scope_creep'] = budget_without_scope_creep
            json_stats['per_role'][role_name]['hours_billable_core_rate'] = hours_billable_core_rate

            if budget > hours_billable_core_rate:
                json_stats['per_role'][role_name]['under_budget'] = True
            else:
                json_stats['per_role'][role_name]['under_budget'] = False

            json_stats['per_role'][role_name]['per_user'] = {}
            for user, user_data in sorted(data['per_user'].iteritems()):
                json_stats['per_role'][role_name]['per_user'][user.pk]\
                    = int(round(user_data['hours_billable_core_rate'] or 0))

        json_stats['per_user'] = dict( [(user.id, d) for user, d in stats['per_user'].items()] )
        for u in json_stats['per_user'].values():
            u['time_tracking_mode'] = u['rate'].time_tracking_mode
            del u['rate']
        
        return json_stats

    def cache_stats(self, start=None, end=None, issues=None):
        stats = {}
        entries = Entry.objects.filter(issue__project=self)

        if issues is None:
            issues = self.issues

        if start is not None:
            entries = entries.filter(start_time__gte=start).filter(end_time__lte=end)
            issues_with_time_entries = issues.filter(entries__in=entries).distinct()
            issues = issues_with_time_entries
        else:
            issues_with_time_entries = issues.all()

        ctc = 0
        billed = 0
        billed_core_rate = 0

        # The 'or 1' clause is so that if the project has no estimates, the ratios still have some meaning.
        number_dev_done = lambda issues_qs : 1.0*sum([ (ii or 1) for ii in  [i[0] for i in issues_qs.filter(Q(status2__name__icontains='dev done')|Q(status2__name__icontains='devdone')|Q(status2__name__icontains="cannot reproduce")).values_list('story_points')]])
        number_tested = lambda issues_qs : 1.0*sum([ (ii or 1) for ii in  [i[0] for i in issues_qs.filter(status2__name__icontains='tested').values_list('story_points')]])
        number_total = lambda issues_qs : 1.0*sum([ (ii or 1) for ii in  [i[0] for i in issues_qs.values_list('story_points')]])

        def get_css_class_for_level(level, reverse_colours=False):
            if level < settings.TRAFFIC_LEVEL_YELLOW:
                return 'traffic_green'  if not reverse_colours else "traffic_red"
            elif level < settings.TRAFFIC_LEVEL_RED:
                return "traffic_green" #traffic_yellow
            else:
                return "traffic_red" if not reverse_colours else "traffic_green"

        for entry in entries:
            ctc += entry.atrate
            billed += entry.atbillablerate
            billed_core_rate += entry.atbillablecorerate

        stats['percentage_spent'] = 100 * float(billed)/float(self.spendable_budget) if self.spendable_budget > 0 else 100.0
        if stats['percentage_spent']>100:
            stats['percentage_spent']=100
        stats['budget_traffic_class'] = get_css_class_for_level(stats['percentage_spent'])
        stats['amount_under_budget'] = float(self.spendable_budget) - float(billed_core_rate)
        stats['amount_over_budget'] = float(billed_core_rate) - float(self.spendable_budget)
        stats['total_issue_points'] = number_total(issues)
        stats['percent_tested'] = 100* (number_tested(issues)/stats['total_issue_points'] if stats['total_issue_points'] > 0 else 1)
        stats['percent_dev_done'] = stats['percent_tested'] + 100 * (number_dev_done(issues)/stats['total_issue_points'] if stats['total_issue_points'] > 0 else 0)
        stats['percent_dev_done_traffic_class'] = get_css_class_for_level(stats['percent_dev_done'], reverse_colours=True)
        stats['percent_tested_traffic_class'] = get_css_class_for_level(stats['percent_tested'], reverse_colours=True)
        stats['ctc'] = ctc
        stats['billed'] = billed
        stats['billed_core_rate'] = billed_core_rate
        stats['start_time'] = self._first_entry_start_time
        stats['end_time'] = self._last_entry_end_time
        stats['entries'] = entries
        stats['issues_with_time_entries'] = issues_with_time_entries

        stats['users_and_hours'] = self._get_users_and_hours(stats)
        stats['cost_per_developer'] = self._get_cost_per_developer(stats)

        unassigned_entries = entries.filter(issue__isnull=True).order_by("start_time")
        stats['unassigned'] = {'entries':unassigned_entries,
                               'costs':unassigned_entries.cost_totals_for_project(self),
                               'comments':unassigned_entries.get_aggregated_info()}

        self._stats = stats
        return stats

    def _get_users_and_hours(self, stats):

        user_totals = stats['entries'].values("user").annotate(hours=Sum('hours'), end_time=Max("end_time"))
        user_totals = dict( (x['user'], x) for x in user_totals )

        users_and_hours = {'users':{}, 'totals':{}}
        total_hours = 0
        total_revenue = 0
        total_billed = 0
        ctc_rate = 0
        billed_rate = 0

        business_users = BusinessPermissions.by_user(self.business)
        for user_id, bp in business_users.items():
            if not bp.is_active_member_of_business:
                continue

            if user_id not in user_totals:
                user_total = {'user':user_id, 'hours':0, 'end_time':datetime.datetime.today()}
            else:
                user_total = user_totals[user_id]

            user = User.objects.get(pk=user_id)
            rate = Rate.objects.filter(project=self, user=user).first()
            if rate is None:
                rate = Rate.objects.create(project=self, user=user, amount=0)

            billed = float(user_total['hours']) * float(rate.full_rate)

            users_and_hours['users'][user.username] = {
                'hours':user_total['hours'],
                'rate':rate,
                'revenue': float(user_total['hours'])*float(rate.amount),
                'end_time': user_total['end_time'],
                'billed': billed
                }
            user_info = users_and_hours['users'][user.username]
            user_info['profit'] = user_info['billed'] - user_info['revenue']
            user_info['velocity'] = rate.velocity

            total_hours += user_total['hours']
            total_revenue += float(user_total['hours'])*float(rate.amount)
            total_billed += float(rate.full_rate) * float(user_total['hours'])
            ctc_rate += float(rate.amount)
            billed_rate += float(rate.full_rate)

        users_and_hours['totals']['hours'] = total_hours
        users_and_hours['totals']['revenue'] = total_revenue
        users_and_hours['totals']['billed'] = total_billed
        users_and_hours['totals']['ctc_rate'] = ctc_rate / len(user_totals) if len(user_totals)>0 else 0
        users_and_hours['totals']['billed_rate'] = billed_rate / len(user_totals) if len(user_totals)>0 else 0
        users_and_hours['totals']['profit'] = total_billed - total_revenue
        return users_and_hours

    def _get_cost_per_developer(self, stats):
        ret = {}

        users_and_hours = stats['users_and_hours']

        for user, points in self.get_points_total().items():
            if user.username not in users_and_hours['users']:
                continue
            user_info = users_and_hours['users'][user.username]
            if user_info['hours'] == 0 and points == 0:
                continue

            try:
                rate = user_info['rate']
            except KeyError:
                continue
            velocity = rate.full_velocity or 1
            user_hours = user_info['hours']

            total_adjusted_billed = points * float(rate.full_rate) * velocity
            total_adjusted_ctc = points * float(rate.amount) * velocity

            ret[user] = {
                'points': points,
                'hours':user_hours,
                'ctc':rate.amount*user_hours,
                'billable':float(rate.full_rate)*float(user_hours),
                'total_adjusted_billed': total_adjusted_billed,
                'total_adjusted_ctc': total_adjusted_ctc,
                'total_adjusted_profit': total_adjusted_billed - total_adjusted_ctc,
                'rate': rate,
                'velocity': (points/float(user_hours)) if float(user_hours)>0 else 1
            }
        return ret

    @property
    def stats(self):
        if self._stats is not None:
            return self._stats
        self.cache_stats()
        return self._stats

    @property
    def _last_entry_end_time(self):
        entries = Entry.objects.filter(issue__project=self).order_by("-end_time")
        if entries.count()>0:
            return entries[0].end_time
        else:
            return None

    @property
    def _first_entry_start_time(self):
        entries = Entry.objects.filter(issue__project=self).order_by("start_time")
        if entries.count()>0:
            return entries[0].start_time
        else:
            return None

    @property
    def total_hours(self):
        return self.total_hours_for_user(user=None)

    def can_view_by_user(self, user):
        return user in self.users.all()

    def total_hours_for_user(self, user=None):
        entries_qs = Entry.objects.filter(issue__project=self)

        if user is not None:
            entries_qs = entries_qs.filter(user=user)

        total = entries_qs.aggregate(hours=Sum('hours'))['hours']
        return total

    def total_unassigned_hours_for_user(self, user):
        entries_qs = Entry.objects.filter(issue__project=self, user=user).filter(issue__isnull=True)
        total = entries_qs.aggregate(hours=Sum('hours'))['hours']
        return total

    def total_points_for_user(self, user, issue_status=None):
        entries_qs = IssuePoints.objects.filter(issue__project=self, user=user)
        if issue_status is not None:
            entries_qs = entries_qs.filter(issue__status2__name=issue_status)

        total = entries_qs.aggregate(points=Sum('points'))['points']
        return total

    def total_points_for_user_for_issues_with_entries(self, user):
        """ returns the sum of all estimates for the given user, for
        issues where the given user has done at least some work """
        issues_with_entries = Issue.objects.filter(id__in=Entry.objects.filter(issue__project=self).filter(user=user).filter(issue__isnull=False).values('issue'))
        total_points = IssuePoints.objects.filter(issue__in=issues_with_entries).filter(user=user).aggregate(points=Sum('points'))
        return total_points['points']

    def get_users_with_time_but_no_estimates_in_this_project(self):
        users = [ User.objects.get(pk=user['user']) for user in Entry.objects.all().filter(issue__project=self).filter(hours__gt=0).exclude(issue__isnull=False).order_by('user').values('user').annotate(Count('user'))]
        return [ user for user in users if not BusinessPermissions.for_user(user, self.business).has_estimate_own_points ]

    # def users_and_hours(self, **entry_filter):
    #     """ deprecated, use the stats property instead """

    #     cache = True
    #     if 'cache' in entry_filter:
    #         cache = entry_filter['cache']
    #         del(entry_filter['cache'])

    #     if self._users_and_hours is not None and cache:
    #         return self._users_and_hours

    #     entries_qs = Entry.objects.filter(project=self)
    #     def key(x):
    #         return x['count']

    #     if entry_filter:
    #         entries_qs = entries_qs.filter(**entry_filter)

    #     user_totals = entries_qs.values("user").annotate(hours=Sum('hours'), end_time=Max("end_time"))
    #     user_totals = dict( (x['user'], x) for x in user_totals )

    #     res = {'users':{}, 'totals':{}}
    #     total_hours = 0
    #     total_revenue = 0
    #     total_billed = 0
    #     ctc_rate = 0
    #     billed_rate = 0

    #     business_users = BusinessPermissions.by_user(self.business)
    #     for user_id, bp in business_users.items():
    #         if not bp.can_view_project_card:
    #             continue

    #         if user_id not in user_totals:
    #             user_total = {'user':user_id, 'hours':0, 'end_time':datetime.datetime.today()}
    #         else:
    #             user_total = user_totals[user_id]

    #         user = User.objects.get(pk=user_id)
    #         try:
    #             rate = Rate.objects.get(project=self, user=user)
    #         except Rate.DoesNotExist:
    #             rate = Rate.objects.create(project=self, user=user, amount=0)

    #         billed = float(user_total['hours']) * float(rate.full_rate)

    #         res['users'][user.username] = {
    #             'hours':user_total['hours'],
    #             'rate':rate,
    #             'revenue': float(user_total['hours'])*float(rate.amount),
    #             'end_time': user_total['end_time'],
    #             'billed': billed
    #             }
    #         user_info = res['users'][user.username]
    #         user_info['profit'] = user_info['billed'] - user_info['revenue']
    #         user_info['velocity'] = rate.velocity

    #         total_hours += user_total['hours']
    #         total_revenue += float(user_total['hours'])*float(rate.amount)
    #         total_billed += float(rate.full_rate) * float(user_total['hours'])
    #         ctc_rate += float(rate.amount)
    #         billed_rate += float(rate.full_rate)
    #     res['totals']['hours'] = total_hours
    #     res['totals']['revenue'] = total_revenue
    #     res['totals']['billed'] = total_billed
    #     res['totals']['ctc_rate'] = ctc_rate / len(user_totals) if len(user_totals)>0 else 0
    #     res['totals']['billed_rate'] = billed_rate / len(user_totals) if len(user_totals)>0 else 0
    #     res['totals']['profit'] = total_billed - total_revenue

    #     self._users_and_hours = res
    #     return res

    class Meta:
        ordering = ('name', 'status3__name', 'type',)
        permissions = (
            ('view_project', 'Can view project'),
            ('email_project_report', 'Can email project report'),
            ('view_project_time_sheet', 'Can view project time sheet'),
            ('export_project_time_sheet', 'Can export project time sheet'),
            ('generate_project_invoice', 'Can generate project invoice'),
        )

    def __unicode__(self):
        return self.name

    def long_name(self):
        return "%s - %s" % (self.business.name, self.name)

    def trac_url(self):
        return settings.TRAC_URL % self.tracker_url

    def get_ordered_issues(self):
        qs = Issue.objects.filter(project=self)
        if self.id:
            qs = qs.order_by_project_id(self.id)
        return qs

    def get_ctc_and_billable_totals(self):
        totals = Issue.objects.filter(project_id=self.id).values('fixed_ctc_amount', 'fixed_amount').aggregate(
        fixed_ctc_total=Sum('fixed_ctc_amount'), fixed_amount_total=Sum('fixed_amount'))

        if totals.get('fixed_ctc_total') is None:
            totals['fixed_ctc_total'] = 0

        if totals.get('fixed_amount_total') is None:
            totals['fixed_amount_total'] = 0

        return totals

class BusinessProjectOrder(BaseModel):
    order = models.FloatField()
    project = models.ForeignKey(Project)
    business = models.ForeignKey(Business)

    class Meta:
        unique_together = ('business', 'project')

    INCREMENT=10
    MAX_ORDER=999999

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(BusinessProjectOrder, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    @classmethod
    def renumber(self, business_id):
        project_ids = Project.objects.filter(business_id=business_id).order_by_business_id(business_id).values_list('pk', flat=True)
        order = 0
        for project_id in project_ids:
            pio = BusinessProjectOrder.objects.get_or_create(business_id=business_id, project_id=project_id,
                                                             defaults={'order':order})[0]
            if pio.order != order:
                pio.order = order
                pio.save()
            order += self.INCREMENT
        BusinessProjectOrder.objects.filter(business_id=business_id).exclude(project__business_id=business_id).delete()

    @classmethod
    def insert_before(self, project, set_before_this_project):
        if project.business_id != set_before_this_project.business_id:
            raise Exception("Cannot reorder, must be in the same business")
        self.renumber(project.business_id)
        pio = self.objects.get_or_create(business_id=set_before_this_project.business_id,
                                         project_id=set_before_this_project.id,
                                         defaults={'order':self.MAX_ORDER})[0]
        new_order = pio.order-1
        pio, is_new = self.objects.get_or_create(business_id=project.business_id, project_id=project.id)
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(project.business_id)

    @classmethod
    def insert_after(self, project, set_after_this_project):
        if project.business_id != set_after_this_project.business_id:
            raise Exception("Cannot reorder, must be in the same business")
        self.renumber(project.business_id)
        pio_target = self.objects.get_or_create(business_id=set_after_this_project.business_id,
                                                project_id=set_after_this_project.id,
                                                defaults={'order':self.MAX_ORDER})[0]
        new_order = pio_target.order+1
        pio, is_new = self.objects.get_or_create(business_id=project.business_id,
                                                 project_id=project.id,
                                                 defaults={'order':new_order})
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(project.business_id)

    @classmethod
    def insert_at_the_beginning(self, project):
        new_order = -1
        pio, is_new = self.objects.get_or_create(business_id=project.business_id, project_id=project.id, defaults={'order':new_order})
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(project.business_id)

    @classmethod
    def insert_at_the_end(self, project):
        new_order = self.get_next_order(project.business_id)
        pio, is_new = self.objects.get_or_create(business_id=project.business_id, project_id=project.id, defaults={'order':new_order})
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(project.business_id)

    @classmethod
    def order_like_this(self, business_id, ordered_project_ids):
        order = 0
        for project_id in ordered_project_ids:
            pio = BusinessProjectOrder.objects.get_or_create(business_id=business_id, project_id=project_id,
                                                          defaults={'order':order})[0]
            if pio.order != order:
                pio.order = order
                pio.save()
            order += self.INCREMENT

    @classmethod
    def sort_these_project_ids(self, business_id, unordered_project_ids):
        return BusinessProjectOrder.objects.filter(business=business_id)\
                                        .filter(project_id__in=unordered_project_ids)\
                                        .order_by("order")\
                                        .values_list("project_id", flat=True)

    @classmethod
    def get_next_order(self, business_id, project_qs=None):
        self.renumber(business_id)
        if project_qs is None:
            project_qs = Project.objects.filter(business_id=business_id)
        max_order = self.objects.filter(business_id=business_id, project__in=project_qs)\
                                .aggregate(max_order=Max('order'))['max_order'] or 0
        return max_order + self.INCREMENT


class BusinessInvite(BaseModel):
    business = models.ForeignKey(Business, related_name='invites', null=False)
    user = models.ForeignKey(User, related_name='invites_received', null=False)
    invite_sent_at = models.DateTimeField(null=True)
    invited_by = models.ForeignKey(User, related_name='invites_sent', null=False)
    accepted = models.BooleanField(default=False, db_index=True)
    accepted_at = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(BusinessInvite, self).save(*args, **kwargs)

        if was_created:
            RefreshNotifier().notify_model_create(self, params={'users': [self.user_id]})
        else:
            RefreshNotifier().notify_model_update(self, params={'users': [self.user_id],
                                                                'projects': [self.business_id]}) #sic

class RelationshipType(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    slug = models.CharField(max_length=255, unique=True, editable=False)

    def save(self, *args, **kwargs):
        queryset = RelationshipType.objects.all()
        if self.id:
            queryset = queryset.exclude(id__exact=self.id)
        self.slug = utils.slugify_uniquely(self.name, queryset, 'slug')
        super(RelationshipType, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.name


class ProjectRelationship(BaseModel):
    types = models.ManyToManyField(
        RelationshipType,
        related_name='project_relationships',
        blank=True,
    )
    user = models.ForeignKey(
        User,
        related_name='project_relationships',
    )
    project = models.ForeignKey(
        Project,
        related_name='project_relationships',
    )

    class Meta:
        unique_together = ('user', 'project')

    def __unicode__(self):
        return "%s's relationship to %s" % (
            self.project.name,
            self.user.get_full_name(),
        )


class Activity(BaseModel):
    """
    Represents different types of activity: debugging, developing,
    brainstorming, QA, etc...
    """
    code = models.CharField(
        max_length=5,
        unique=True,
        help_text='Enter a short code to describe the type of ' + \
            'activity that took place.'
    )
    name = models.CharField(
        max_length=50,
        help_text="""Now enter a more meaningful name for the activity.""",
    )
    billable = models.BooleanField(default=True)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('name',)
        verbose_name_plural = 'activities'


class HourGroupManager(models.Manager):
    def summaries(self, entries):
        #Get the list of bundle names and hour sums
        bundled_entries = entries.values('activity__activity_bundle',
                                         'activity__activity_bundle__name')
        bundled_entries = bundled_entries.annotate(Sum('hours'))
        bundled_entries = bundled_entries.order_by(
                                            'activity__activity_bundle__order',
                                            'activity__activity_bundle__name'
        )
        bundled_totals = list(bundled_entries.values_list(
                                             'activity__activity_bundle__name',
                                             'activity__activity_bundle',
                                             'hours__sum')
        )
        #Get the list of activity names and hour sums
        activity_entries = entries.values('activity', 'activity__name',
                                          'activity__activity_bundle')
        activity_entries = activity_entries.annotate(Sum('hours'))
        activity_entries = activity_entries.order_by('activity')
        activity_totals = list(activity_entries.values_list(
                                                   'activity__name',
                                                   'activity__activity_bundle',
                                                   'hours__sum')
        )
        totals = {}
        other_values = ()
        for bundle in bundled_totals:
            bundle_key, bundle_value = bundle[0], bundle[2]
            act_values = [(act[0], act[2]) for act in activity_totals \
                          if act[1] == bundle[1]]
            if bundle_key is not None:
                totals[bundle_key] = (bundle_value, act_values)
            else:
                other_values = (bundle_value, act_values)
        totals = sorted(totals.items())
        if other_values:
            totals.append(('Other', other_values))
        all_totals = sum([bt[2] for bt in bundled_totals])
        totals.append(('Total', (all_totals, [])))
        return totals


class HourGroup(BaseModel):
    """Activities that are bundled together for billing"""

    name = models.CharField(max_length=255, unique=True)
    activities = models.ManyToManyField(
        Activity,
        related_name='activity_bundle',
    )
    order = models.PositiveIntegerField(unique=True, blank=True, null=True)

    objects = HourGroupManager()

    def __unicode__(self):
        return self.name


class ActivityGroup(BaseModel):
    """Activities that are allowed for a project"""

    name = models.CharField(max_length=255, unique=True)
    activities = models.ManyToManyField(
        Activity,
        related_name='activity_group',
    )

    def __unicode__(self):
        return self.name


class Location(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    slug = models.CharField(max_length=255, unique=True)

    def __unicode__(self):
        return self.name


ENTRY_STATUS = (
    ('unverified', 'Unverified',),
    ('verified', 'Verified',),
    ('approved', 'Approved',),
    ('invoiced', 'Invoiced',),
    ('not-invoiced', 'Not Invoiced',),
)

class EntriesQuerySet(QuerySet):
    def filter_by_logged_in_user(self, user):
        """ restricts entries to those belonging to projects the given
        user (typically the logged in user) is assigned to """
        return self.filter(Q(issue__isnull=True)|Q(issue__project__business__in=BusinessPermissions.active_businesses_for_user(user)))

    def cost_totals_for_project(self, project):
        """ this function assumes that all entries in the queryset
        belong to the same project, and so passing in the project is
        simply to enforce this from the calling side. """

        hours = 0
        ctc = 0
        billable = 0
        hours_per_users = self.order_by("user").values('user').annotate(user_hours=Sum('hours'))

        for hours_per_user in hours_per_users:
            try:
                rate = Rate.objects.filter(user_id=hours_per_user['user'], project_id=project.id)[0]
            except IndexError:
                rate = Rate(billable_amount=0, amount=0, project=project)

            hours += hours_per_user['user_hours']
            ctc += hours_per_user['user_hours'] * rate.amount
            billable += float(hours_per_user['user_hours']) * float(rate.full_rate)

        ctc_and_billable_totals = project.get_ctc_and_billable_totals()
        ctc += ctc_and_billable_totals['fixed_ctc_total']
        billable += ctc_and_billable_totals['fixed_amount_total']

        return { 'hours': hours,
                 'ctc': ctc,
                 'billable': billable }

    def get_aggregated_info(self):
        return self.order_by('comments').values('comments').annotate(x=Count('comments'), hours=Sum('hours'))

    def hours_for_user(self, user_id):
        return self.filter(user_id=user_id).aggregate(num_hours=Sum('hours'))['num_hours']

    def hours_for_business(self, business_id):
        return self.filter(issue__project__business_id=business_id).aggregate(num_hours=Sum('hours'))['num_hours']

    def hours(self):
        return self.aggregate(num_hours=Sum('hours'))['num_hours']

    def billable_for_user(self, user_id):
        total = 0
        qs = self.filter(user_id=user_id).values('issue__project').annotate(num_hours=Sum('hours'))
        for entry in qs:
            rate = Rate.objects.filter(project_id=entry['issue__project'], user_id=user_id).values('billable_amount').first()
            if rate is not None:
                total += rate['billable_amount'] * entry['num_hours']
        return total

    def billable_for_business(self, business_id):
        total = 0
        qs = self.filter(issue__project__business_id=business_id).values('issue__project', 'user').annotate(num_hours=Sum('hours'))
        for entry in qs:
            rate = Rate.objects.filter(project_id=entry['issue__project'], user_id=entry['user']).values('billable_amount').first()
            if rate is not None:
                total += rate['billable_amount'] * entry['num_hours']
        return total

    def billable(self):
        total = 0
        qs = self.values('issue__project', 'user').annotate(num_hours=Sum('hours'))
        for entry in qs:
            rate = Rate.objects.filter(project_id=entry['issue__project'], user_id=entry['user']).values('billable_amount').first()
            if rate is not None:
                total += rate['billable_amount'] * entry['num_hours']
        return total

class EntryQuerySet(EntriesQuerySet):
    """QuerySet extension to provide filtering by billable status"""

    def is_open(self):
        return self.filter(end_time__isnull=True)

    def is_closed(self):
        return self.filter(end_time__isnull=False)

    def timespan(self, from_date, to_date=None, span='month'):

        if span and not to_date:
            diff = None
            if span == 'month':
                diff = relativedelta(months=1)
            if span == 'week':
                diff = relativedelta(days=7)
            if span == 'day':
                diff = relativedelta(days=1)
            if diff is not None:
                to_date = from_date + diff

        datesQ = Q()
        if from_date:
            datesQ &= Q(end_time__gte=from_date)
        if to_date:
            datesQ &= Q(end_time__lt=to_date) if to_date else Q()
        return self.filter(datesQ)

    def date_trunc(self, key='month', extra_values=None):
        select = {"day": {"date": """DATE_TRUNC('day', end_time)"""},
                  "week": {"date": """DATE_TRUNC('week', end_time)"""},
                  "month": {"date": """DATE_TRUNC('month', end_time)"""},
        }
        basic_values = (
            'user', 'date', 'user__first_name', 'user__last_name',
        )
        extra_values = extra_values or ()
        qs = self.extra(select=select[key])
        qs = qs.values(*basic_values + extra_values)
        qs = qs.annotate(hours=Sum('hours')).order_by('user__last_name',
                                                      'date')
        return qs

    def by_day(self):
        return self.extra(select={'started_on':"date(start_time)"})\
                   .values('started_on')\
                   .order_by('started_on')\
                   .annotate(daily_hours=Sum('hours'))

    def order_by_project_id(self, project_id, descending=False, supplementary_orders=None):
        if project_id:
            direction = ("-" if descending else "") + "order"
            issue_ids_in_order = ProjectIssueOrder.objects.filter(issue__project_id=project_id)\
                                                          .order_by(direction)\
                                                          .values_list("issue_id", flat=True)
            if issue_ids_in_order.count() == 0:
                return self
            preserved = Case(*[When(issue_id=pk, then=pos) for pos, pk in enumerate(issue_ids_in_order)])

            orders = [preserved]
            if supplementary_orders:
                orders.extend(supplementary_orders)
            
            return self.order_by(*orders)
        else:
            return self
    
    # def timespan(self, from_date, to_date=None, span=None):
    #     """
    #     Takes a beginning date a filters entries. An optional to_date can be
    #     specified, or a span, which is one of ('month', 'week', 'day').
    #     N.B. - If given a to_date, it does not include that date, only before.
    #     """
    #     if span and not to_date:
    #         diff = None
    #         if span == 'month':
    #             diff = relativedelta(months=1)
    #         if span == 'week':
    #             diff = relativedelta(days=7)
    #         if span == 'day':
    #             diff = relativedelta(days=1)
    #         if diff is not None:
    #             to_date = from_date + diff

    #     datesQ = Q()
    #     if from_date:
    #         datesQ &= Q(end_time__gte=from_date)
    #     if to_date:
    #         datesQ &= Q(end_time__lt=to_date) if to_date else Q()
    #     return self.filter(datesQ)

#  class EntryManagerBase(QuerySetManager):
#     def __init__(self, *args, **kwargs):
#         super(EntryManagerBase, self).__init__(EntryQuerySet, *args, **kwargs)

#     def date_trunc(self, key='month', extra_values=()):
#         return self.get_query_set().date_trunc(key, extra_values)


# class EntryManager(models.Manager):
#     pass
    # def get_query_set(self):
    #     qs = EntryQuerySet(self.model)
    #     #qs = qs.select_related('activity', 'project__type')

    #     # ensure our select_related are added.  Without this line later calls
    #     # to select_related will void ours (not sure why - probably a bug
    #     # in Django)
    #     # in other words: do not remove!
    #     #str(qs.query)

    #     #qs = qs.extra({'billable': 'timepiece_activity.billable AND '
    #     #                           'timepiece_attribute.billable'})
    #     return qs


# class EntryWorkedManager(EntryManager):

#     def get_query_set(self):
#         qs = EntryQuerySet(self.model)
#         projects = getattr(settings, 'TIMEPIECE_PROJECTS', {})
#         return qs.exclude(project__in=projects.values())

class EntryQuerySetForReporting(QuerySet):
    def total_hours(self):
        return self.aggregate(total_hours=Sum('hours'))['total_hours']


class Entry(BaseModel):
    """
    This class is where all of the time logs are taken care of
    """

    user = models.ForeignKey(User, related_name='timepiece_entries')
    activity = models.ForeignKey(
        Activity,
        related_name='entries',
        null=True
    )
    location = models.ForeignKey(
        Location,
        related_name='entries',
        null=True
    )
    entry_group = models.ForeignKey(
       'EntryGroup',
        related_name='entries',
        blank=True, null=True,
        on_delete=models.SET_NULL
    )
    status = models.CharField(
        max_length=24,
        choices=ENTRY_STATUS,
        default='unverified',
    )

    source = models.CharField(max_length=20, choices= ( ('quick_clocker', 'Quick clocker'),
                                                        ('emacs', 'Emacs importer'),
                                                        ('excel', 'In-site Excel importer') ),
                              null=False, blank=False)

    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True, db_index=True)
    seconds_paused = models.PositiveIntegerField(default=0)
    pause_time = models.DateTimeField(blank=True, null=True)
    comments = models.TextField(blank=True, null=True)
    extended_comments = models.TextField(blank=True)
    date_updated = models.DateTimeField(auto_now=True)
    role = ProtectedForeignKey(ProjectRole, related_name='entries', null=True, blank=True)

    hours = models.DecimalField(max_digits=12, decimal_places=4, default=0)

    objects = EntryQuerySet.as_manager()
    objects_original = models.Manager()
    objects_for_reporting = EntryQuerySetForReporting.as_manager()

    issue = ProtectedForeignKey('Issue', blank=True, null=True, related_name='entries')

    created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='entries_created_by', null=True, blank=True)

    @classmethod
    def quick_create(self, user, hours, issue, comments="auto created"):
        entry = self.create_virtual_event(user, hours, issue.project, comments)
        entry.save()
        return entry

    @classmethod
    def create_virtual_event(self, user, hours, issue, comments="auto created", start_time=None):
        if start_time is None:
            start_time = datetime.datetime.today()
        end_time = start_time + timedelta(hours=hours)

        activity = Activity.objects.get_or_create(code='dev')[0]
        location = Location.objects.get_or_create(name='office')[0]
        entry = Entry(user=user,
                      start_time=start_time,
                      end_time=end_time,
                      activity=activity,
                      location=location,
                      issue=issue,
                      status='approved',
                      comments=comments)
        return entry

    @property
    def project(self):
        return self.issue.project

    @property
    def is_active(self):
        return self.end_time is None
    
    @property
    def hours_and_minutes(self):
        full_hours = int(self.hours)
        minutes_fraction = self.hours - full_hours
        minutes = int(minutes_fraction*60)
        return { 'hours': full_hours,
                 'minutes': minutes }

    @classmethod
    def get_oldest_day_for_allowed_clocking(self, user):
        return CalendarEvent.date_num_working_days_from(user=user,
                                                        start_date_inclusive=timezone.now().replace(hour=0,minute=0),
                                                        num_days=settings.NUM_BUSINESS_DAYS_FOR_ALLOWED_CLOCKING,
                                                        direction=-1)
    
    @property
    def atrate(self):
        return self.hours * self.rate

    @property
    def atbillablerate(self):
        return float(self.hours) * float(self.billable_rate)

    @property
    def atbillablecorerate(self):
        rate = self._rate_object()
        if rate:
            return float(self.hours) * float(rate.billable_amount)
        return 0

    @property
    def billable_rate(self):
        rate = self._rate_object()
        if rate:
            return rate.full_rate
        return 0
    
    @property
    def rate(self):
        rate = self._rate_object()
        if rate:
            return rate.amount
        return 0

    def _rate_object(self):
        try:
            return self._rate
        except AttributeError:
            try:
                self._rate = Rate.objects.get(project=self.issue.project, user=self.user)
            except Rate.DoesNotExist:
                return None
            except Rate.MultipleObjectsReturned:
                self._rate = Rate.objects.filter(project=self.issue.project, user=self.user).first()
            return self._rate



    @classmethod
    def set_hours_for_user(self, user, issue, new_hours):
        qs = Entry.objects.filter(user=user, issue=issue)
        if qs.aggregate(total_hours=Sum('hours'))['total_hours'] != new_hours:
            qs.delete()
            Entry.quick_create(user=user, hours=new_hours, issue=issue, comments='set manually')

    def check_overlap(self, entry_b, **kwargs):
        """
        Given two entries, return True if they overlap, otherwise return False
        """
        consider_pause = kwargs.get('pause', True)
        entry_a = self
        #if entries are open, consider them to be closed right now
        if not entry_a.end_time or not entry_b.end_time:
            return False
        #Check the two entries against each other
        start_inside = entry_a.start_time > entry_b.start_time \
            and entry_a.start_time < entry_b.end_time
        end_inside = entry_a.end_time > entry_b.start_time \
            and entry_a.end_time < entry_b.end_time
        a_is_inside = entry_a.start_time > entry_b.start_time \
            and entry_a.end_time < entry_b.end_time
        b_is_inside = entry_a.start_time < entry_b.start_time \
            and entry_a.end_time > entry_b.end_time
        overlap = start_inside or end_inside or a_is_inside or b_is_inside
        if not consider_pause:
            return overlap
        else:
            if overlap:
                max_end = max(entry_a.end_time, entry_b.end_time)
                min_start = min(entry_a.start_time, entry_b.start_time)
                diff = max_end - min_start
                diff = diff.seconds + diff.days * 86400
                total = entry_a.get_seconds() + entry_b.get_seconds() - 1
                if total >= diff:
                    return True
            return False

    def is_overlapping(self):
        if self.start_time and self.end_time:
            entries = self.user.timepiece_entries.filter(
            Q(end_time__range=(self.start_time, self.end_time)) | \
            Q(start_time__range=(self.start_time, self.end_time)) | \
            Q(start_time__lte=self.start_time, end_time__gte=self.end_time))

            totals = entries.aggregate(
            max=Max('end_time'), min=Min('start_time'))

            totals['total'] = 0
            for entry in entries:
                totals['total'] = totals['total'] + entry.get_seconds()

            totals['diff'] = totals['max'] - totals['min']
            totals['diff'] = totals['diff'].seconds + \
                totals['diff'].days * 86400

            if totals['total'] > totals['diff']:
                return True
            else:
                return False
        else:
            return None

    def clean(self):
        if not self.user_id:
            raise ValidationError('An unexpected error has occured')
        if not self.start_time:
            raise ValidationError('Please enter a valid start time')
        start = self.start_time
        if self.end_time:
            end = self.end_time
        #Current entries have no end_time
        else:
            end = start + datetime.timedelta(seconds=1)
        entries = self.user.timepiece_entries.filter(
            Q(end_time__range=(start, end)) | \
            Q(start_time__range=(start, end)) | \
            Q(start_time__lte=start, end_time__gte=end))
        #An entry can not conflict with itself so remove it from the list
        if self.id:
            entries = entries.exclude(pk=self.id)
        for entry in entries:
            entry_data = {
                'project': entry.issue.project,
                'activity': entry.activity,
                'start_time': entry.start_time,
                'end_time': entry.end_time
            }
        if end <= start:
            raise ValidationError('Ending time must exceed the starting time')
        delta = (end - start)
        delta_secs = (delta.seconds + delta.days * 24 * 60 * 60)
        limit_secs = 60 * 60 * 12
        if delta_secs > limit_secs or self.seconds_paused > limit_secs:
            err_msg = 'Ending time exceeds starting time by 12 hours or more '\
                'for {0} on {1} at {2} to {3} at {4}.'.format(
                    self.project.name,
                    start.strftime('%m/%d/%Y'),
                    start.strftime('%H:%M:%S'),
                    end.strftime('%m/%d/%Y'),
                    end.strftime('%H:%M:%S')
                )
            raise ValidationError(err_msg)
        month_start = utils.get_month_start(start)
        next_month = month_start + relativedelta(months=1)
        entries = self.user.timepiece_entries.filter(
            Q(status='approved') | Q(status='invoiced'),
            start_time__gte=month_start,
            end_time__lt=next_month
        )
        return True

    def save(self, *args, **kwargs):
        was_created = not self.id
        self.hours = Decimal('%.4f' % round(self.total_hours, 4))
        super(Entry, self).save(*args, **kwargs)

        if self.source != 'emacs':
            if was_created:
                RefreshNotifier().notify_model_create(self, params={'sprint_id': [self.issue.project_id if self.issue else None]})
            else:
                RefreshNotifier().notify_model_update(self, params={'sprint_id': [self.issue.project_id] if self.issue else None})

    def delete(self, *args, **kwargs):
        if self.source != 'emacs':
            RefreshNotifier().notify_model_delete(self)
        super(Entry, self).delete(*args, **kwargs)
            
    def get_seconds(self):
        """
        Determines the difference between the starting and ending time.  The
        result is returned as an integer of seconds.
        """
        if self.start_time and self.end_time:
            # only calculate when the start and end are defined
            delta = api.localise_date(self.end_time) - api.localise_date(self.start_time)
            seconds = delta.seconds - self.seconds_paused
        else:
            seconds = 0
            delta = datetime.timedelta(days=0)

        return seconds + (delta.days * 86400)

    @property
    def running_hours(self):
        if self.end_time:
            return self.hours
        return (timezone.now() - self.start_time).seconds
    
    def __total_hours(self):
        """
        Determined the total number of hours worked in this entry
        """
        total = self.get_seconds() / 3600.0
        #in case seconds paused are greater than the elapsed time
        if total < 0:
            total = 0
        return total
    total_hours = property(__total_hours)

    def __is_paused(self):
        """
        Determine whether or not this entry is paused
        """
        return bool(self.pause_time)
    is_paused = property(__is_paused)

    def pause(self):
        """
        If this entry is not paused, pause it.
        """
        if not self.is_paused:
            self.pause_time = timezone.now()

    def pause_all(self):
        """
        Pause all open entries
        """
        entries = self.user.timepiece_entries.filter(
        end_time__isnull=True).all()
        for entry in entries:
            entry.pause()
            entry.save()

    def unpause(self, date=None):
        if self.is_paused:
            if not date:
                date = timezone.now()
            delta = date - self.pause_time
            self.seconds_paused += delta.seconds
            self.pause_time = None

    def toggle_paused(self):
        """
        Toggle the paused state of this entry.  If the entry is already paused,
        it will be unpaused; if it is not paused, it will be paused.
        """
        if self.is_paused:
            self.unpause()
        else:
            self.pause()

    def __is_closed(self):
        """
        Determine whether this entry has been closed or not
        """
        return bool(self.end_time)
    is_closed = property(__is_closed)

    def clock_in(self, user, project):
        """
        Set this entry up for saving the first time, as an open entry.
        """
        if not self.is_closed:
            self.user = user
            self.project = project
            if not self.start_time:
                self.start_time = timezone.now()

    def __is_editable(self):
        #return self.status == 'unverified'
        return self.project.is_open

    is_editable = property(__is_editable)

    def __delete_key(self):
        """
        Make it a little more interesting for deleting logs
        """
        salt = '%i-%i-apple-%s-sauce' \
            % (self.id, self.is_paused, self.is_closed)
        try:
            import hashlib
        except ImportError:
            import sha
            key = sha.new(salt).hexdigest()
        else:
            key = hashlib.sha1(salt).hexdigest()
        return key
    delete_key = property(__delete_key)

    @staticmethod
    def summary(user, date, end_date):
        """
        Returns a summary of hours worked in the given time frame, for this
        user.  The setting TIMEPIECE_PROJECTS can be used to separate out hours
        for paid leave that should not be included in the total worked (e.g.,
        sick time, vacation time, etc.).  Those hours will be added to the
        summary separately using the dictionary key set in TIMEPIECE_PROJECTS.
        """
        projects = getattr(settings, 'TIMEPIECE_PROJECTS', {})
        entries = user.timepiece_entries.filter(
            end_time__gt=date, end_time__lt=end_date)
        data = {
            'billable': Decimal('0'), 'non_billable': Decimal('0'),
            'invoiced': Decimal('0'), 'uninvoiced': Decimal('0'),
            'total': Decimal('0')
            }


        uninvoiced = entries.exclude(status='invoiced').aggregate(uninv=Sum('hours'))['uninv']
        invoiced = entries.filter(status='invoiced').filter(issue__project__billable=True).aggregate(total=Sum('hours'))['total']
        unbillable = entries.filter(status='invoiced').exclude(issue__project__billable=True).aggregate(total=Sum('hours'))['total']

        # invoiced = entries.filter(
        #     status='invoiced').aggregate(i=Sum('hours'))['i']
        # uninvoiced = entries.exclude(
        #     status='invoiced').aggregate(uninv=Sum('hours'))['uninv']
        total = entries.aggregate(s=Sum('hours'))['s']
        if invoiced:
            data['invoiced'] = invoiced
        if uninvoiced:
            data['uninvoiced'] = uninvoiced
        if unbillable:
            data['unbillable'] = unbillable
        if total:
            data['total'] = total
        # billable = entries.exclude(project__in=projects.values())
        # billable = billable.values(
        #     'billable',
        # ).annotate(s=Sum('hours'))
        # for row in billable:
        #     if row['billable']:
        #         data['billable'] += row['s']
        #     else:
        #         data['non_billable'] += row['s']
        data['paid_leave'] = {}
        for name, pk in projects.iteritems():
            qs = entries.filter(issue__project=projects[name])
            data['paid_leave'][name] = qs.aggregate(s=Sum('hours'))['s']
        return data

    class Meta:
        verbose_name_plural = 'entries'
        permissions = (
            ('can_clock_in', 'Can use Pendulum to clock in'),
            ('can_pause', 'Can pause and unpause log entries'),
            ('can_clock_out', 'Can use Pendulum to clock out'),
            ('view_entry_summary', 'Can view entry summary page'),
            ('view_payroll_summary', 'Can view payroll summary page'),
        )

    def try_get_issue_id(self):
        """ Make a best attempt to identify what the issue number. """
        return Issue.extract_issue_id(self.comments)

class EntryGroup(BaseModel):
    VALID_STATUS = ('invoiced', 'not-invoiced')
    STATUS_CHOICES = [status for status in ENTRY_STATUS \
                      if status[0] in VALID_STATUS]
    user = models.ForeignKey(User, related_name='entry_group')
    project = models.ForeignKey(Project, related_name='entry_group')
    status = models.CharField(max_length=24, choices=STATUS_CHOICES,
                              default='invoiced')
    number = models.CharField("Reference #", max_length=50, blank=True,
                              null=True)
    comments = models.TextField(blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    start = models.DateField(blank=True, null=True)
    end = models.DateField()

    def delete(self):
        self.entries.update(status='approved')
        super(EntryGroup, self).delete()

    def __unicode__(self):
        invoice_data = {
            'number': self.number,
            'status': self.status,
            'project': self.project,
            'end': self.end.strftime('%b %Y'),
        }
        return u'Entry Group ' + \
               u'%(number)s: %(status)s - %(project)s - %(end)s' % invoice_data


# Add a utility method to the User class that will tell whether or not a
# particular user has any unclosed entries
User.clocked_in = property(lambda user: user.timepiece_entries.filter(
    end_time__isnull=True).count() > 0)


class ProjectContract(BaseModel):
    CONTRACT_STATUS = (
        ('upcoming', 'Upcoming'),
        ('current', 'Current'),
        ('complete', 'Complete'),
    )

    project = models.ForeignKey(Project, related_name='contracts')
    start_date = models.DateField()
    end_date = models.DateField()
    num_hours = models.DecimalField(max_digits=12, decimal_places=2,
                                    default=0)
    status = models.CharField(choices=CONTRACT_STATUS, default='upcomming',
                              max_length=32)

    def hours_worked(self):
        # TODO put this in a .extra w/a subselect
        if not hasattr(self, '_hours_worked'):
            self._hours_worked = Entry.objects.filter(
                issue__project=self.project,
                start_time__gte=self.start_date,
                end_time__lt=self.end_date + datetime.timedelta(days=1),
            ).aggregate(sum=Sum('hours'))['sum']
        return self._hours_worked or 0

    @property
    def hours_assigned(self):
        # TODO put this in a .extra w/a subselect
        if not hasattr(self, '_hours_assigned'):
            self._hours_assigned =\
              self.assignments.aggregate(sum=Sum('num_hours'))['sum']
        return self._hours_assigned or 0

    @property
    def hours_allocated(self):
        allocations = AssignmentAllocation.objects.filter(
            assignment__contract=self)
        return allocations.aggregate(sum=Sum('hours'))['sum']

    @property
    def hours_remaining(self):
        return self.num_hours - self.hours_worked()

    @property
    def weeks_remaining(self):
        return utils.generate_dates(end=self.end_date, by='week')

    def __unicode__(self):
        return unicode(self.project)


class ContractMilestone(BaseModel):
    contract = models.ForeignKey(ProjectContract, related_name='milestones')
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    hours = models.DecimalField(max_digits=12, decimal_places=2,
                                default=0)

    class Meta(object):
        ordering = ('end_date',)

    def hours_worked(self):
        """Hours worked during this milestone"""
        if not hasattr(self, '_hours_worked'):
            self._hours_worked = Entry.objects.filter(
                issue__project=self.contract.project,
                start_time__gte=self.start_date,
                end_time__lt=self.end_date + datetime.timedelta(days=1),
            ).aggregate(sum=Sum('hours'))['sum']
        return self._hours_worked or 0

    def total_budget(self):
        """Total budget through the end of this milestone"""
        if not hasattr(self, '_total_budget'):
            end_date = self.end_date + datetime.timedelta(days=1)
            previous = self.contract.milestones.filter(end_date__lt=end_date)
            self._total_budget = previous.aggregate(sum=Sum('hours'))['sum']
        return self._total_budget or 0

    def total_hours_worked(self):
        """Total hours worked on project through the end of this milestone"""
        if not hasattr(self, '_total_hours_worked'):
            self._total_hours_worked = Entry.objects.filter(
                issue__project=self.contract.project,
                start_time__gte=self.contract.start_date,
                end_time__lt=self.end_date + datetime.timedelta(days=1),
            ).aggregate(sum=Sum('hours'))['sum']
        return self._total_hours_worked or 0

    def hours_remaining(self):
        """Hours over the milestone budget"""
        return self.hours - self.hours_worked()

    def total_hours_remaining(self):
        """Hours over the entire project budget"""
        return self.total_budget() - self.total_hours_worked()

    def is_before(self):
        return self.start_date > datetime.date.today()

    def is_complete(self):
        return self.end_date < datetime.date.today()


class AssignmentManager(models.Manager):

    def active_during_week(self, week, next_week):
        q = Q(contract__end_date__gte=week, contract__end_date__lt=next_week)
        q |= Q(contract__start_date__gte=week,
            contract__start_date__lt=next_week)
        q |= Q(contract__start_date__lt=week, contract__end_date__gt=next_week)
        return self.get_query_set().filter(q)

    def sort_by_priority(self):
        return sorted(self.get_query_set().all(),
            key=lambda contract: contract.this_weeks_priority_number)



class ContractAssignment(BaseModel):
    contract = models.ForeignKey(ProjectContract, related_name='assignments')
    user = models.ForeignKey(
        User,
        related_name='assignments',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    num_hours = models.DecimalField(max_digits=12, decimal_places=2,
                                    default=0)
    min_hours_per_week = models.IntegerField(default=0)

    objects = AssignmentManager()

    def _log(self, msg):
        logger.debug('{0} - {1}'.format(self, msg))

    def _filtered_hours_worked(self, end_date):
        return Entry.objects.filter(
            user=self.user,
            issue__project=self.contract.project,
            start_time__gte=self.start_date,
            end_time__lt=end_date,
        ).aggregate(sum=Sum('hours'))['sum'] or 0

    def filtered_hours_worked_with_in_window(self, start_date, end_date):
        return Entry.objects.filter(
            user=self.user,
            issue__project=self.contract.project,
            start_time__gte=start_date,
            end_time__lt=end_date,
        ).aggregate(sum=Sum('hours'))['sum'] or 0

    @property
    def hours_worked(self):
        if not hasattr(self, '_hours_worked'):
            date = self.end_date + datetime.timedelta(days=1)
            self._hours_worked = self._filtered_hours_worked(date)
        return self._hours_worked or 0

    @property
    def hours_remaining(self):
        return self.num_hours - self.hours_worked

    @property
    def this_weeks_priority_number(self):
        """
        Only works if already filtered to the current week. Otherwise groups
        outside the range will be listed as ongoing instead of befor or after.
        """
        if not hasattr(self, '_priority_type'):
            weeks = utils.get_week_window(timezone.now())
            try:
                end_date = self.end_date.date()
                start_date = self.start_date.date()
            except:
                end_date = self.end_date
                start_date = self.start_date
            if end_date < weeks[1].date() \
            and end_date >= weeks[0].date():
                self._priority_type = 0
            elif start_date < weeks[1].date() \
            and start_date >= weeks[0].date():
                self._priority_type = 1
            else:
                self._priority_type = 2
        return self._priority_type

    @property
    def this_weeks_priority_type(self):
        type_list = ['ending', 'starting', 'ongoing', ]
        return type_list[self.this_weeks_priority_number]

    def get_average_weekly_committment(self):
        week_start = utils.get_week_start()
        # calculate hours left on contract (subtract worked hours this week)
        remaining = self.num_hours - self._filtered_hours_worked(week_start)
        commitment = remaining / self.contract.weeks_remaining.count()
        return commitment

    def weekly_commitment(self, day=None):
        self._log("Commitment for {0}".format(day))
        # earlier assignments may have already allocated time for this week
        unallocated = self.unallocated_hours_for_week(day)
        self._log('Unallocated hours {0}'.format(unallocated))
        reserved = self.remaining_min_hours()
        self._log('Reserved hours {0}'.format(reserved))
        # start with unallocated hours
        commitment = unallocated
        # reserve required hours on later assignments (min_hours_per_week)
        commitment -= self.remaining_min_hours()
        self._log('Commitment after reservation {0}'.format(commitment))
        # if we're under the needed minimum hours and we have available
        # time, then raise our commitment to the desired level
        if commitment < self.min_hours_per_week \
        and unallocated >= self.min_hours_per_week:
            commitment = self.min_hours_per_week
        self._log('Commitment after minimum weekly hours {0}'\
            .format(commitment))
        # calculate hours left on contract (subtract worked hours this week)
        week_start = utils.get_week_start(day)
        remaining = self.num_hours - self._filtered_hours_worked(week_start)
        total_allocated = self.blocks.aggregate(s=Sum('hours'))['s'] or 0
        remaining -= total_allocated
        if remaining < 0:
            remaining = 0
        self._log('Remaining {0}'.format(remaining))
        # reduce commitment to remaining hours
        if commitment > remaining:
            commitment = remaining
        self._log('Final commitment {0}'.format(commitment))
        return commitment

    def allocated_hours_for_week(self, day):
        week, next_week = utils.get_week_window(day)
        allocs = AssignmentAllocation.objects
        allocs = allocs.filter(assignment__user=self.user)
        allocs = allocs.filter(date__gte=week, date__lt=next_week)
        hours = allocs.aggregate(s=Sum('hours'))['s']
        return hours or 0

    def unallocated_hours_for_week(self, day):
        """ Calculate number of hours left to work for a week """
        allocated = self.allocated_hours_for_week(day)
        self._log('Allocated hours {0}'.format(allocated))
        try:
            schedule = PersonSchedule.objects.filter(user=self.user)[0]
        except IndexError:
            schedule = None
        if schedule:
            unallocated = schedule.hours_per_week - allocated
        else:
            unallocated = 40 - allocated
        return unallocated

    def remaining_contracts(self):
        assignments = ContractAssignment.objects.exclude(pk=self.pk)
        assignments = assignments.filter(end_date__gte=self.end_date,
                                         user=self.user)
        return assignments.order_by('-end_date')

    def remaining_min_hours(self):
        return self.remaining_contracts().aggregate(
            s=Sum('min_hours_per_week'))['s'] or 0

    class Meta:
        unique_together = (('contract', 'user'),)

    def __unicode__(self):
        return u'%s / %s' % (self.user, self.contract.project)


class AllocationManager(models.Manager):

    def during_this_week(self, user, day=None):
        week = utils.get_week_start(day=day)
        return self.get_query_set().filter(
            date=week, assignment__user=user,
            assignment__contract__status='current'
            ).exclude(hours=0)


class AssignmentAllocation(BaseModel):
    assignment = models.ForeignKey(ContractAssignment, related_name='blocks')
    date = models.DateField()
    hours = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    @property
    def hours_worked(self):
        if not hasattr(self, '_hours_worked'):
            end_date = self.date + datetime.timedelta(weeks=1)
            self._hours_worked = self.assignment.\
                    filtered_hours_worked_with_in_window(self.date, end_date)
        return self._hours_worked or 0

    @property
    def hours_left(self):
        if not hasattr(self, '_hours_left'):
            self._hours_left = self.hours - self.hours_worked
        return self._hours_left or 0

    objects = AllocationManager()

class PersonSchedule(BaseModel):
    user = models.OneToOneField(
        User,
        #unique=True,
        null=True,
    )
    hours_per_week = models.DecimalField(max_digits=12, decimal_places=2,
                                         default=0)
    end_date = models.DateField()

    @property
    def furthest_end_date(self):
        assignments = self.user.assignments.order_by('-end_date')
        assignments = assignments.exclude(contract__status='complete')
        try:
            end_date = assignments.values('end_date')[0]['end_date']
        except IndexError:
            end_date = self.end_date
        return end_date

    @property
    def hours_available(self):
        today = datetime.date.today()
        weeks_remaining = (self.end_date - today).days / 7.0
        return float(self.hours_per_week) * weeks_remaining

    @property
    def hours_scheduled(self):
        if not hasattr(self, '_hours_scheduled'):
            self._hours_scheduled = 0
            now = timezone.now()
            for assignment in self.user.assignments.filter(end_date__gte=now):
                self._hours_scheduled += assignment.hours_remaining
        return self._hours_scheduled

    def __unicode__(self):
        return unicode(self.user)


class UserProfile(BaseModel):
    user = models.OneToOneField(User, unique=True, related_name='profile')
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    billable_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    project_names_to_ignore = models.TextField(blank=True)
    authenticate_token = models.CharField(max_length=100, blank=True, null=True, help_text="Authentication token remote connections")
    impd_client = models.ForeignKey(Company, null=True, blank=False, related_name='profiles')

    required_daily_work_hours = models.IntegerField(default=8, null=False, blank=True)

    class Meta:
        ordering = ('user',)
        permissions = ( ( 'can_manage_client_users', 'Can manage client users' ), )

    def __unicode__(self):
        return unicode(self.user.username)

    def save(self, *args, **kwargs):
        if not self.authenticate_token:
            self.authenticate_token = str(uuid.uuid4()).replace("-","")
        super(UserProfile, self).save(*args, **kwargs)

    @property
    def businesses(self):
        return Business.objects.all().filter_by_logged_in_user(self.user).order_by("name").distinct()

    @property
    def best_business_for_permissions(self):
        """ for use in cases where a businesspermissions object is required for a user,
        but without a specific business """
        return self.businesses.first()

class UserAutoLoginToken(BaseModel):
    user = models.OneToOneField(User, unique=True, related_name='auto_login')
    token = models.CharField(max_length=100)
    expire_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    @classmethod
    def get_auto_login_token(self, user):
        a = UserAutoLoginToken.objects.get_or_create(user=user, defaults={'expire_at':timezone.now()})[0]
        a.expire_at = timezone.now() + relativedelta(hours=settings.AUTO_LOGIN_EXPIRE_IN_HOURS)
        a.token = str(uuid.uuid4()).replace("-","")+str(uuid.uuid4()).replace("-","")
        a.used = False
        a.save()
        return a.token

    @classmethod
    def check_and_use_auto_login(self, token):
        a = UserAutoLoginToken.objects.filter(token=token).first()
        if a is None or a.used == True or a.expire_at < timezone.now():
            return None
        a.used = True
        a.save()
        return a.user


class ProjectHours(BaseModel):
    week_start = models.DateField(verbose_name='start of week')
    project = models.ForeignKey(Project)
    user = models.ForeignKey(User)
    hours = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    published = models.BooleanField(default=False)

    def __unicode__(self):
        return "{0} on {1} for Week of {2}".format(self.user.get_full_name(),
                self.project, self.week_start.strftime('%B %d, %Y'))

    def save(self, *args, **kwargs):
        # Ensure that week_start is the Monday of a given week.
        self.week_start = utils.get_week_start(self.week_start)
        return super(ProjectHours, self).save(*args, **kwargs)

    class Meta:
        verbose_name = 'project hours entry'
        verbose_name_plural = 'project hours entries'
        unique_together = ('week_start', 'project', 'user')

class SalaryQuerySet(QuerySet):
    def amount(self):
        return self.aggregate(Sum('amount'))['amount__sum']

class Salary(BaseModel):
    user = models.ForeignKey(User)
    amount = models.DecimalField(max_digits=12,decimal_places=2,default=0)
    date = models.DateField(verbose_name='month')
    paye = models.DecimalField(max_digits=12,decimal_places=2,default=0)
    uif = models.DecimalField(max_digits=12,decimal_places=2,default=0)
    bonus = models.DecimalField(max_digits=12,decimal_places=2,default=0)
    expenses = models.DecimalField(max_digits=12,decimal_places=2,default=0)
    leave_accrued = models.DecimalField(max_digits=12,default=0,decimal_places=2, verbose_name="Leave accrued this month")
    leave_taken = models.DecimalField(max_digits=12,default=0,decimal_places=2, verbose_name="Leave taken this month")
    sick_days = models.DecimalField(max_digits=12,default=0,decimal_places=2, verbose_name="Sick days taken this month")
    locked = models.BooleanField(default=False)

    objects = SalaryQuerySet.as_manager()

    @property
    def net_pay(self):
        return self.amount + self.bonus - self.paye - self.uif

    @property
    def take_home_total(self):
        return self.net_pay - self.expenses

    def copy_from_previous(self):
        previous = Salary.objects.filter(user=self.user, date__lt=self.date).order_by("-date")
        if previous.count()>0:
            previous = previous[0]
            self.amount = previous.amount if previous else None
            self.uif = previous.uif
            self.paye = previous.paye
            self.leave_accrued = previous.leave_accrued
            self.leave_taken = 0
            self.bonus = 0
            self.expenses = 0
            self.save()
            return previous

    def ytd(self):
        # From start of current tax year
        tax_year_start = datetime.datetime(self.date.year, 3, 1)
        if self.date.month < 3:
            tax_year_start = datetime.datetime(tax_year_start.year-1, tax_year_start.month, tax_year_start.day)
        ytd = Salary.objects.filter(user=self.user, date__gte=tax_year_start, date__lte=self.date).values('user') \
            .annotate(ytd_amount=Sum('amount'), ytd_bonus=Sum('bonus'), ytd_paye=Sum('paye'), ytd_uif=Sum('uif'), ytd_expenses=Sum('expenses'))[0]

        #return {'take_home_total': ytd['ytd_amount'] - ytd['ytd_paye'] - ytd['ytd_uif'] - ytd['ytd_expenses'],
        return {'take_home_total': ytd['ytd_amount']+ytd['ytd_bonus'],
                'paye': ytd['ytd_paye']}

    @property
    def leave_summary(self):
        # Since start of employment
        total_leave = Salary.objects.filter(user=self.user,date__lte=self.date).values('user') \
            .annotate(total_leave_accrued=Sum('leave_accrued'), total_leave_taken=Sum('leave_taken'))[0]
        return { 'total_leave_accrued':total_leave['total_leave_accrued'],
                 'total_leave_taken':total_leave['total_leave_taken'],
                 'total_leave_due':total_leave['total_leave_accrued']-total_leave['total_leave_taken'],
                 'leave_accured_this_month':self.leave_accrued,
                 'leave_taken_this_month':self.leave_taken }

class Rate(BaseModel):
    TIME_TRACKING_MODES = [ ('developer', 'Developer'), ('manager', 'Manager'), ('tester', 'Tester') ]
    project = models.ForeignKey(Project, related_name="rate")
    user = models.ForeignKey(User, related_name="rates")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0) #ctc
    billable_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    velocity = models.FloatField(default=1)
    work_ratio = models.FloatField(default=0)
    time_tracking_mode = models.CharField(default="developer", max_length=50, choices=TIME_TRACKING_MODES, null=False )

    def save(self, *args, **kwargs):
        recalc_secondary_estimates = kwargs.pop('recalc_secondary_estimates', False)
        was_created = not self.id
        super(Rate, self).save(*args, **kwargs)
        if recalc_secondary_estimates:
            self.project.recalc_secondary_estimates()
            
        if was_created:
            RefreshNotifier().notify_model_create(self, params={'sprint_id': str(self.project_id),
                                                                'user_id': str(self.user_id)})
        else:
            RefreshNotifier().notify_model_update(self, params={'sprint_id': str(self.project_id),
                                                                'user_id': str(self.user_id)})
            

    def sanitize_rate(self):
        """ Helper function to ensure that all sensitive financial information is cleared. 
            This is mainly for serialization, you wouldn't expect to save this object now """
        self.billable_amount = None
        self.amount = None
        
    @classmethod
    def full_rate_for_project(self, user_id, project_id):
        rate = self.objects.filter(user_id=user_id, project_id=project_id).first()
        return rate.full_rate if rate else 0

    @property
    def full_rate(self):
        return self.convert_to_full_rate(self.project, self.billable_amount)

    @classmethod
    def convert_to_full_rate(self, project, amount):
        comm_ratio = (1-project.commission_percentage/100) or 1
        return float(amount) / comm_ratio

    @property
    def full_velocity(self):
        return self.convert_to_full_velocity(self.project, self.velocity)

    @classmethod
    def convert_to_full_velocity(self, project, velocity):
        return velocity * (1+float(project.ratio_scope_creep))

    @classmethod
    def for_business(self, user_id, business_id):
        """ best guess """
        return Rate.objects.filter(user_id=user_id, project__business_id=business_id).order_by("-id").first()

class Expense(BaseModel):
    date = models.DateField()
    amount = models.DecimalField(max_digits=12,decimal_places=0,default=0)
    description = models.CharField(max_length=255, blank=True, null=True)
    project = models.ForeignKey(Project, related_name='expense', null=True, blank=True)
    paid = models.BooleanField()
    class Meta:
        permissions = (
            ('view_expense', 'Can view expenses.'),
        )

class Income(BaseModel):
    date = models.DateField()
    amount = models.DecimalField(max_digits=12,decimal_places=0,default=0)

# class Invoice(BaseModel):
#     description = models.CharField(max_length=255, blank=True, null=True)
#     date_sent = models.DateField(blank=True,null=True)
#     date_paid = models.DateField(blank=True,null=True)
#     amount = models.DecimalField(max_digits=12,decimal_places=0,default=0)
#     project = models.ForeignKey(Project, related_name='invoices', null=True, blank=True)
#     invoice_number = models.DecimalField(max_digits=12, decimal_places=0,default=0)
#     paid = models.BooleanField()

#     class Meta:
#         permissions = (
#             ('view_invoice', 'Can view invoices.'),
#         )

class TagCategory(BaseModel):
    class Meta:
        unique_together = ('business', 'name')

    business = models.ForeignKey(Business, null=False, related_name='tag_categories')
    name = models.CharField(max_length=100, default='general', null=False, blank=True, db_index=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(TagCategory, self).save(*args, **kwargs)
        affected_issue_ids = [x for x in Issue.objects.all().filter(tags__category=self).values_list('id', flat=True)]
        if was_created:
            RefreshNotifier().notify_model_create(
                self, params={'issues': affected_issue_ids})
        else:
            RefreshNotifier().notify_model_update(
                self, params={'issues': affected_issue_ids})


class Tag(BaseModel):

    class Meta:
        unique_together = ('name', 'category')

    category = models.ForeignKey(TagCategory, null=False, related_name='tags')
    name = models.CharField(max_length=100, null=False, blank=True, db_index=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.name = self.name.lower()

        was_created = not self.id
        super(Tag, self).save(*args, **kwargs)
        affected_issues = [x.id for x in self.issues.all()]
        if was_created:
            RefreshNotifier().notify_model_create(
                self, params={'issues': affected_issues})
        else:
            RefreshNotifier().notify_model_update(
                self, params={'issues': affected_issues})

class IssueStatus(BaseModel):
    name = models.CharField(max_length=255, blank=True, null=True)
    business = models.ForeignKey(Business, related_name='issue_statuses')
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('name', 'business'), )

    def __unicode__(self):
        return self.name

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(IssueStatus, self).save(*args, **kwargs)
        affected_issues = [x.id for x in self.issues.all()]
        if was_created:
            RefreshNotifier().notify_model_create(
                self, params={'issues': affected_issues})
        else:
            RefreshNotifier().notify_model_update(
                self, params={'issues': affected_issues})


class IssueRepresentation(object):
    """ object used to map helper data when rendering issues that doesn't belong in the database """

    @property
    def options(self):
        return str([ list(pair) for pair in Issue.ISSUE_STATUS_CHOICES ])


class IssueQuerySet(QuerySet):

    def filter_by_logged_in_user(self, user):
        """ restricts entries to those belonging to projects the given
        user (typically the logged in user) is assigned to """
        return self.filter(project__business__in=BusinessPermissions.active_businesses_for_user(user))

    def filter_open(self, user):
        return self.filter(Q(project__rate__user=user,
                             project__rate__time_tracking_mode='developer',
                             status2__name__in=Issue.STATUSES_INDICATING_INCOMPLETE['developer'])|
                           Q(project__rate__user=user,
                             project__rate__time_tracking_mode='tester',
                             status2__name__in=Issue.STATUSES_INDICATING_INCOMPLETE['tester'])|
                           Q(project__rate__user=user,
                             project__rate__time_tracking_mode='manager',
                             status2__name__in=Issue.STATUSES_INDICATING_INCOMPLETE['manager']))

    def order_by_project_id(self, project_id, descending=False):
        if project_id:
            direction = ("-" if descending else "") + "order"
            issue_ids_in_order = ProjectIssueOrder.objects.filter(project_id=project_id)\
                                                          .order_by(direction)\
                                                          .values_list("issue_id", flat=True)
            if issue_ids_in_order.count() == 0:
                return self
            preserved = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(issue_ids_in_order)])

            return self.order_by(preserved)
        else:
            return self


class Issue(BaseModel):

    ISSUE_STATUS_CHOICES = (
        ('new', 'new'),
        ('dev in progress', 'dev in progress'),
        ('dev_done', 'dev done'),
        ('in_internal_qa', 'internal qa'),
        ('internal_qa_passed', 'internal qa passed'),
        ('in_client_qa', 'external qa'),
        ('client_qa_passed', 'external qa passed'),
        ('reopened', 'reopened'),
        ('blocked', 'blocked'),
        ('waiting', 'waiting'),
        ('bug', 'bug'),
        ('to be estimated', 'to be estimated'),
        ('needscodereview', 'needs code review'),
        ("cannot reproduce", "cannot reproduce"),
        ("discuss with client", "discuss with client"),
        ('dev unclear', 'dev unclear'),
        ('duplicate', 'duplicate'),
        ('to be designed', 'to be designed'),
        ('imported', 'imported'),
        ('management', 'management'),
        ('quick_clocker', 'quick clocker'),
    )
 
    STATUSES_INDICATING_INCOMPLETE = { 'developer': ['new', 'bug', 'reopened', 'dev unclear', 'dev in progress',
                                                     'discuss_with_client', 'needscodereview', 'blocked', 'waiting',
                                                     'to be designed'],
                                       'manager': [y for x,y in ISSUE_STATUS_CHOICES if x not in ['client_qa_passed', 'duplicate', "onhold"]],
                                       'tester': [y for x,y in ISSUE_STATUS_CHOICES if x not in ['internal_qa_passed', 'in_client_qa', 'client_qa_passed', 'duplicate', "onhold"]] }

    STATUSES_INDICATING_MANAGER_ATTENTION = [ 'blocked', 'waiting', 'to be designed', 'cannot reproduce' ]
    
    ISSUE_TYPES = ( ('issue', 'Issue'),
                    ('adhoc', 'Adhoc'),
                    ('management-general', 'General management'),
                    ('management-meeting', 'Create issues for speccing and scoping'),
                    ('management-spec', 'Create issues for speccing and scoping'),
                    ('management-finance', 'Performing recons and finance tasks'),
                    ('management-assign', 'Assign issues'),
                    ('management-estimate', 'Estimate issues'),
                    ('management-testables', 'Create testables'),
                    ('correspondence', 'Correspondence'),
                    ('minutes', 'Minutes')
    )
    TESTABLE_ISSUE_TYPES = [ 'issue', 'correspondence', 'minutes' ]
    MANAGEMENT_ISSUE_TYPES = [x[0] for x in ISSUE_TYPES if x[0] not in TESTABLE_ISSUE_TYPES]

    status2 = models.ForeignKey(IssueStatus, related_name='issues', null=True)
    number = models.IntegerField(null=True,blank=True, db_index=True)
    project = models.ForeignKey(Project, related_name='issues')
    subject = models.TextField(db_index=True)
    subject_quality_error = models.TextField(null=True)
    description = models.TextField(blank=True)
    enriched_description = models.TextField(blank=True, null=True)
    story_points = models.FloatField(null=True,blank=True)
    order_deprecated = models.FloatField(null=True,blank=True) #deprecated
    assigned_to = models.ForeignKey(User, related_name='assigned_issues', blank=True,null=True)
    interface_plugin_number = models.CharField(max_length=255, null=True, blank=True) #eg jira
    created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='created_issues', blank=True,null=True)
    modified = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(default=None, null=True, blank=True)
    auto_created_during_import = models.BooleanField(default=False)
    issue_type = models.CharField(max_length=50, choices=ISSUE_TYPES, default='issue', null=False)
    fixed_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    fixed_ctc_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    needs_issues = models.ManyToManyField("Issue", related_name="issues_needing_us")

    can_group_issues = models.BooleanField(default=False)
    parent_group = models.ForeignKey("Issue", blank=True, null=True, related_name='group_children')
    tags = models.ManyToManyField("Tag", related_name="issues")

    share_ref = models.CharField(max_length=40, null=True)
    share_ref_created_at = models.DateTimeField(null=True)

    risky = models.BooleanField(default=False)

    objects = IssueQuerySet().as_manager()

    def save(self, *args, **kwargs):
        was_created = not self.id
        do_dependancy_check = kwargs.pop('do_dependancy_check', True)
        super(Issue, self).save(*args, **kwargs)
        self.check_quality()

        from imptime.models import Feature
        
        params = { 'project_id': self.project_id,  #sic
                   'sprint_id': self.project_id,
                   'feature_ids': [x.id for x in Feature.objects.filter(testables__implementing_issues=self.id)]
        }

        if was_created:
            RefreshNotifier().notify_model_create(self, params)
        else:
            RefreshNotifier().notify_model_update(self, params)

        if do_dependancy_check:
            for other_issue in self.needs_issues.all():
                other_issue.save(do_dependancy_check=False)
            for other_issue in self.issues_needing_us.all():
                other_issue.save(do_dependancy_check=False)
            

    def copy(self, logged_in_user, add_suffix=True):
        issue_to_clone = self
        new_issue = Issue.objects.create(
            project_id=issue_to_clone.project_id,   # sic
            description=issue_to_clone.description,
            status2=issue_to_clone.status2,
            number=Issue.get_next_issue_number(issue_to_clone.project.business),
            subject=issue_to_clone.subject + (" (clone)" if add_suffix else ""),
            assigned_to=issue_to_clone.assigned_to,
            created = timezone.now(),
            modified = timezone.now(),
            auto_created_during_import = False,
            issue_type = issue_to_clone.issue_type,
            fixed_amount = issue_to_clone.fixed_amount,
            fixed_ctc_amount = issue_to_clone.fixed_ctc_amount,
            can_group_issues = issue_to_clone.can_group_issues,
            parent_group_id = issue_to_clone.parent_group_id,
            created_by=logged_in_user)

        for testable in self.testables.all().order_by("order"):
            new_testable = testable.copy()
            new_testable.issue = new_issue
            new_testable.save()

        for comment in self.comments.all().order_by("created"):
            new_comment = comment.copy()
            new_comment.issue = new_issue
            new_comment.save()

        for tag in self.tags.all():
            new_issue.tags.add(tag)
            new_issue.save()

        return new_issue

    def delete(self, *args, **kwargs):
        params = { 'project_id': self.project_id }
        RefreshNotifier().notify_model_delete(self, params)
        super(Issue, self).delete(*args, **kwargs)

    def check_quality(self):
        quality_error = Quality().check_short_sentence(self.subject)
        if quality_error != self.subject_quality_error:
            self.subject_quality_error = quality_error
            super(Issue, self).save()


    @classmethod
    def get_last_issue_number(self, business):
        largest_number =  Issue.objects.filter(project__business=business).filter(number__isnull=False).aggregate(largest_number=Max("number"))['largest_number']

        return largest_number or 0

    def currently_clocked_in_by(self):
        active_clocks = Entry.objects.filter(issue_id=self.id).is_open()
        return [ x.user for x in active_clocks ]

    @property
    def testable(self):
        return self.testables.first()

    @classmethod
    def get_next_issue_number(self, business):
        return Issue.get_last_issue_number(business) +1

    def __init__(self, *args, **kwargs):
        super(Issue, self).__init__(*args, **kwargs)
        self._entries = None
        self.representation = IssueRepresentation()
        self.representation.per_user = OrderedDict()

    def status_as_class(self):
        return 'status_%s' % self.status2.name.replace(" ","_").lower()

    def get_points(self):
        business_users = self.project.business.users
        for user in business_users:
            try:
                IssuePoints.objects.get(user=user, issue=self)
            except IssuePoints.DoesNotExist:
                IssuePoints.objects.create(user=user,issue=self)

        return self.user_points.filter(user__id__in=[i.id for i in business_users]).order_by("user")

    @property
    def status_name(self):
        return self.status2.name

    def move_after(self, other_issue):
        ProjectIssueOrder.insert_after(issue=self, set_after_this_issue=other_issue)

    def renumber_issue_order(self):
        ProjectIssueOrder.renumber(self.project_id)

    def set_order(self):
        ProjectIssueOrder.insert_at_the_end(self)
        return self

    def get_next_child_order(self):
        return ProjectIssueOrder.get_next_order(project_id=self.project_id,
                                                issue_qs=Issue.objects.filter(parent_group=self))

    @classmethod
    def get_next_order(self, project):
        return ProjectIssueOrder.get_next_order(project_id=project.id)

    def get_issue_points_by_user(self):
        return dict( [ (x['user'], float(x['points'] or 0)) for x in IssuePoints.objects.filter(issue=self).values('user', 'points') ] )

    def get_user_issue_points(self, user):

        if isinstance(user,basestring):
            user = User.objects.get(username=user)

        try:
            return IssuePoints.objects.get(user=user, issue=self)
        except IssuePoints.DoesNotExist:
            business_users = [u.id for u in self.project.business.users]
            if user.id in business_users:
                return IssuePoints.objects.get_or_create(user=user,issue=self)[0]
            return None
        except IssuePoints.MultipleObjectsReturned:
            return IssuePoints.objects.filter(user=user,issue=self).order_by("id")[0]

    def set_points(self, user, points):
        issue_points = IssuePoints.objects.get_or_create(user=user, issue=self)[0]
        if issue_points != points:
            issue_points.points = points
            issue_points.save()

    @classmethod
    def extract_issue_id(self, s):
        """ Make a best attempt to identify what the issue number. """
        issue_id = None

        for regex in [ "[iI]ssue *#(\d+)", "[iI]ssue(\d+)", "[iI]ssue (\d+)" ]:
            match_object = re.compile(regex).search(s)
            if match_object and match_object.groups() != 0:
                try:
                    issue_id = int(match_object.group(1))
                    return issue_id
                except Exception:
                    pass
        return issue_id

    @property
    def issue_number_duplicates_in_business(self):
        return Issue.objects.filter(project__business=self.project.business).filter(number=self.number).exclude(pk=self.id)

    @property
    def css_class(self):
        status_name = self.status2.name.replace(" ","").replace("_","").lower()
        if status_name == 'devdone':
            return "devdone"
        elif status_name == 'tested':
            return "tested"
        else:
            return "open"

    def is_closed(self):
        return self.status2.name.replace(" ","").lower() == 'tested'

    def add_user_to_representation(self, user, per_user_issue_data):
        self.representation.per_user[user] = per_user_issue_data

    @property
    def related_entries(self):
        return self.entries.all()

    @property
    def sorted_related_entries(self):
        return self.entries.all().order_by('start_time')

    @property
    def colour(self):
        return self.project.business.get_colour_for_status(self.status2.name)

    @property
    def hours(self):
        return self.related_entries.all().aggregate(total_hours=Sum('hours'))['total_hours']

    @property
    def hours_for_user(self, user):
        return self.related_entries.all().filter(user=user).aggregate(total_hours=Sum('hours'))['total_hours'] or 0

    def get_issue_hours_by_user(self):
        return dict( [ (x['user'], float(x['hours'] or 0)) for x in self.related_entries.all().filter(hours__gt=0).values("user").order_by("user").annotate(hours=Sum('hours')) ] )

    def hours_for_users(self):
        return [ (User.objects.get(pk=x['user']), x['hours']) for x in self.related_entries.all().filter(hours__gt=0).values("user").order_by("user").annotate(hours=Sum('hours')) ]

    def get_assigned_hours_estimate(self):
        if not self.assigned_to:
            return 0, None
        bp = BusinessPermissions.for_user(self.assigned_to, self.project.business)
        if bp is None or not bp.has_estimate_own_points:
            return 0, None
        user_issue_points = self.get_user_issue_points(self.assigned_to)
        if not user_issue_points or not user_issue_points.points:
            return 0, self.assigned_to
        return user_issue_points.points, self.assigned_to

    def set_assigned_hours_estimate(self, hours):
        if not self.assigned_to:
            return
        bp = BusinessPermissions.for_user(self.assigned_to, self.project.business)
        if bp is None or not bp.has_estimate_own_points:
            return
        self.set_points(self.assigned_to, hours)

    @property
    def ctc(self):
        cost = 0
        for entry in self.related_entries:
            cost += entry.atrate

        if self.is_fixed_ctc_cost():
            cost += self.fixed_ctc_amount

        return cost

    @property
    def billable(self):
        cost = 0
        for entry in self.related_entries:
            cost += entry.atbillablerate

        if self.is_fixed_cost():
            cost += self.fixed_amount

        return cost

    @classmethod
    def get_adhoc_timesheet_entries(self, project):
        return Entry.objects.filter(issue__project=project, issue__issue_type__in=Issue.MANAGEMENT_ISSUE_TYPES)

    def comments_in_order(self):
        return self.comments.all().order_by("-created")

    def testables_in_order(self):
        return self.testables.all().order_by("order")

    def is_fixed_cost(self):
        return self.fixed_amount is not None

    def is_fixed_ctc_cost(self):
        return self.fixed_ctc_amount is not None

class IssueComment(BaseModel):

    COMMENT_TYPES = ( ('comment', 'Comment'),
                      ('correspondence', 'Correspondence'),
                      ('timesheet', 'Timesheet'),
                      ('raw_spec', 'Raw spec' ) )
    
    issue = models.ForeignKey(Issue, blank=False, null=False, related_name='comments')
    comment = models.TextField(blank=True)
    author = models.ForeignKey(User, related_name='issue_comments', blank=False, null=False)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    comment_type = models.CharField(max_length=50, choices=COMMENT_TYPES, null=False, default='comment')
    enriched_comment = models.TextField(blank=True, null=True)

    share_ref = models.CharField(max_length=40, null=True)
    share_ref_created_at = models.DateTimeField(null=True)

    def copy(self):
        return IssueComment.objects.create(issue=self.issue,
                                           comment=self.comment,
                                           author=self.author)

class ProjectIssueOrder(BaseModel):
    order = models.FloatField()
    issue = models.ForeignKey(Issue, related_name='project_issue_orders')
    project = models.ForeignKey(Project)

    class Meta:
        unique_together = ('project', 'issue')

    INCREMENT=10
    MAX_ORDER=999999

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(ProjectIssueOrder, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    @classmethod
    def renumber(self, project_id):
        issue_ids = Issue.objects.filter(project_id=project_id).order_by_project_id(project_id).values_list('pk', flat=True)
        order = 0
        for issue_id in issue_ids:
            pio = ProjectIssueOrder.objects.get_or_create(project_id=project_id, issue_id=issue_id,
                                                          defaults={'order':order})[0]
            if pio.order != order:
                pio.order = order
                pio.save()
            order += self.INCREMENT
        ProjectIssueOrder.objects.filter(project_id=project_id).exclude(issue__project_id=project_id).delete()

    @classmethod
    def insert_before(self, issue, set_before_this_issue):
        if issue.project_id != set_before_this_issue.project_id:
            raise Exception("Cannot reorder, must be in the same project")
        self.renumber(issue.project_id)
        pio = self.objects.get_or_create(project_id=set_before_this_issue.project_id,
                                         issue_id=set_before_this_issue.id,
                                         defaults={'order':self.MAX_ORDER})[0]
        new_order = pio.order-1
        pio, is_new = self.objects.get_or_create(project_id=issue.project_id, issue_id=issue.id)
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(issue.project_id)

    @classmethod
    def insert_after(self, issue, set_after_this_issue):
        if issue.project_id != set_after_this_issue.project_id:
            raise Exception("Cannot reorder, must be in the same project")
        self.renumber(issue.project_id)
        pio_target = self.objects.get_or_create(project_id=set_after_this_issue.project_id,
                                                issue_id=set_after_this_issue.id,
                                                defaults={'order':self.MAX_ORDER})[0]
        new_order = pio_target.order+1
        pio, is_new = self.objects.get_or_create(project_id=issue.project_id,
                                                 issue_id=issue.id,
                                                 defaults={'order':new_order})
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(issue.project_id)

    @classmethod
    def insert_at_the_beginning(self, issue):
        new_order = -1
        pio, is_new = self.objects.get_or_create(project_id=issue.project_id, issue_id=issue.id, defaults={'order':new_order})
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(issue.project_id)

    @classmethod
    def insert_at_the_end(self, issue):
        new_order = self.get_next_order(issue.project_id)
        pio, is_new = self.objects.get_or_create(project_id=issue.project_id, issue_id=issue.id, defaults={'order':new_order})
        if not is_new:
            pio.order = new_order
            pio.save()
        self.renumber(issue.project_id)

    @classmethod
    def order_like_this(self, project_id, ordered_issue_ids):
        order = 0
        for issue_id in ordered_issue_ids:
            pio = ProjectIssueOrder.objects.get_or_create(project_id=project_id, issue_id=issue_id,
                                                          defaults={'order':order})[0]
            if pio.order != order:
                pio.order = order
                pio.save()
            order += self.INCREMENT

    @classmethod
    def sort_these_issue_ids(self, project_id, unordered_issue_ids):
        return ProjectIssueOrder.objects.filter(project=project_id)\
                                        .filter(issue_id__in=unordered_issue_ids)\
                                        .order_by("order")\
                                        .values_list("issue_id", flat=True)

    @classmethod
    def get_next_order(self, project_id, issue_qs=None):
        self.renumber(project_id)
        if issue_qs is None:
            issue_qs = Issue.objects.filter(project_id=project_id)
        max_order = self.objects.filter(project_id=project_id, issue__in=issue_qs)\
                                .aggregate(max_order=Max('order'))['max_order'] or 0
        return max_order + self.INCREMENT

    @classmethod
    def get_previous_issue(self, issue):
        issue_order = ProjectIssueOrder.objects.filter(issue=issue).values("order").first()
        if issue_order is None:
            return None
        previous = ProjectIssueOrder.objects.filter(project=issue.project_id,
                                                    order__lt=issue_order['order'])\
                                            .values("issue")\
                                            .order_by("-order").first()
        if previous is None:
            return None
        return previous['issue']
        

class RedmineToTimepieceBusinessMapping(BaseModel):
    redmine_business_name = models.CharField(max_length=255)
    timepiece_business_name = models.CharField(max_length=255)

    @classmethod
    def find_from_redmine(self, redmine_business_name):
        try:
            return RedmineToTimepieceBusinessMapping.objects.get(redmine_business_name=redmine_business_name).timepiece_business_name
        except RedmineToTimepieceBusinessMapping.DoesNotExist:
            return redmine_business_name

class RedmineToTimepieceProjectMapping(BaseModel):
    timepiece_business_name = models.CharField(max_length=255)
    redmine_project_code = models.CharField(max_length=255)
    timepiece_project_code = models.CharField(max_length=255)

    @classmethod
    def find_from_redmine(self, timepiece_business_name, redmine_project_name):
        redmine_project_code = Project.get_code_from_name(redmine_project_name)
        try:
            return RedmineToTimepieceProjectMapping.objects.get(timepiece_business_name=timepiece_business_name, redmine_project_code=redmine_project_code).timepiece_project_code
        except RedmineToTimepieceProjectMapping.DoesNotExist:
            return redmine_project_code

class IssuePoints(BaseModel):

    class Meta:
        unique_together = (('user','issue'),)

    user = models.ForeignKey(User,related_name="user_points")
    points = models.FloatField(null=True,blank=True)
    issue = models.ForeignKey(Issue, related_name="issue_points")

    def __unicode__(self):
        return u'%s:%s - %s hours' % (self.issue.subject, self.user.username, self.points)

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(IssuePoints, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self, params={'issue_id': str(self.issue_id),
                                                                'sprint_id': str(self.issue.project_id),
                                                                'user_id': str(self.user_id)})
        else:
            RefreshNotifier().notify_model_update(self, params={'issue_id': str(self.issue_id),
                                                                'sprint_id': str(self.issue.project_id),
                                                                'user_id': str(self.user_id)})
    
class IssueHistory(BaseModel):

    issue_id = models.IntegerField(blank=False, null=False, db_index=True)
    original_issue = models.ForeignKey(Issue, null=True, db_index=True, on_delete=SET_NULL, related_name="histories")
    created_by = models.ForeignKey(User, blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=False, null=False)
    before = models.TextField(blank=True, null=True)
    after = models.TextField(blank=True, null=True)
    money_sensitive = models.BooleanField(default=False) #true if refers to project commercials

    @classmethod
    def add_history(self, user, issue, description, before, after):
        IssueHistory.objects.create(created_by=user,
                                    original_issue=issue,
                                    issue_id=issue.id,
                                    description=description,
                                    before=before, after=after)

    @classmethod
    def for_issue(self, issue):
        return IssueHistory.objects.filter(issue_id=issue.id).order_by("-created_at")

class BusinessHistory(BaseModel):

    business_id = models.IntegerField(blank=False, null=False, db_index=True)
    created_by = models.ForeignKey(User, blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=False, null=False)
    before = models.TextField(blank=True, null=True)
    after = models.TextField(blank=True, null=True)

    @classmethod
    def add_history(self, user, business, description, before, after):
        BusinessHistory.objects.create(created_by=user, business_id=business.id, description=description,
                                       before=before, after=after)

    @classmethod
    def for_business(self, business):
        return BusinessHistory.objects.filter(business_id=business.id).order_by("-created_at")


class BusinessDocument(BaseModel):

    DOC_TYPE_CHOICES = ( ('invoice', 'Invoice'), ('summary', 'Sprint summary'),
                         ('proposal', 'Sprint proposal'), ('contract', 'Contract'),
                         ('other', 'Other') )

    business = models.ForeignKey(Business, null=False, blank=False, related_name='documents', db_index=True)
    project = models.ForeignKey(Project, null=True, blank=True, related_name='documents', db_index=True)
    filename = models.CharField(max_length=255, null=False, blank=False)
    doc = models.FileField(max_length=255, upload_to=upload_to_project_documents, null=False, blank=False)
    doc_type = models.CharField(max_length=100, null=False, blank=False,
                                choices = DOC_TYPE_CHOICES )
    mime_type = models.CharField(max_length=50, null=False, blank=False)
    token = models.CharField(max_length=255, null=False, blank=False, db_index=True)
    comments = models.TextField(null=True, blank=True)
    deleted = models.BooleanField(default=False, blank=True)
    original_content = models.TextField(null=True, blank=True)

    created_by = models.ForeignKey(User, null=False, blank=False, related_name='business_document_created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(User, null=False, blank=False, related_name='business_document_modified_by')

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = str(uuid.uuid4()).replace("-","")
        super(BusinessDocument, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.filename


class CalendarEvent(BaseModel):

    EVENT_TYPES = ( ('planned', 'Planned'), ('meeting', 'Meeting'), ('leave', 'Leave'), ('sickday', 'Sick day'),
                    ('office_closed', 'Office Closed'), ('personal', 'Personal'),
                    ('deadline', 'Deadline') )
    EVENT_STATUSES = ( ('ready', 'Ready'), ('done', 'Done'), ('cancelled', 'Cancelled'), ("CONFIRMED", "Confirmed"), ("UNKNOWN", "UNKNOWN") )

    NON_WORKING_EVENT_TYPES = ["sickday", "leave", "office_closed"]

    user = models.ForeignKey(User, blank=False, null=False, db_index=True)
    business = models.ForeignKey(Business, blank=True, null=True, db_index=True, related_name='calendar_events')
    start = models.DateTimeField(blank=False,null=False, db_index=True)
    hours = models.DecimalField(max_digits=4, decimal_places=2, default=2.0, db_index=True)
    description = models.TextField(null=True, blank=True)
    event_type = models.CharField( max_length=50, default='planned', choices=EVENT_TYPES)
    status = models.CharField(null=False, blank=False, max_length=50, default='ready')
    send_invites_to = models.TextField(null=True, blank=True) # comma separated list of email addresses
    caldav_uid = models.CharField(null=True, max_length=100, blank=True, db_index=True)

    def save(self, update_caldav=True, *args, **kwargs):
        if type(self.start) == date:
            # Set time to the middle of the day to avoid timezone problems
            self.start = datetime.datetime(self.start.year, self.start.month, self.start.day, 12, 0, 0)
            
        super(CalendarEvent, self).save(*args, **kwargs)

        if not self.caldav_uid and self.id:
            self.caldav_uid = "imptime%s" % str(self.id)
            super(CalendarEvent, self).save()

        if update_caldav:
            try:
                CalDavHelper().on_event_saved(imptime_event=self)
            except Exception, ex:
                logger.exception(ex)

    def delete(self, update_caldav=True, *args, **kwargs):
        try:
            CalDavHelper().on_event_deleted(self)
        except Exception, ex:
            logger.exception(ex)

        if update_caldav:
            super(CalendarEvent, self).delete(*args, **kwargs)

    @property
    def event_users(self):
        users = set()
        users.add(self.user)
        if self.send_invites_to:
            for email in self.send_invites_to.split(","):
                user = User.objects.filter(email=email.strip()).first()
                if user:
                    users.add(user)
        return users

    @classmethod
    def date_num_working_days_from(self, user, start_date_inclusive, num_days, direction=+1):
        running_date = start_date_inclusive
        while num_days > 0:
            if self.is_working_day(user, running_date):
                num_days += direction
            running_date += relativedelta(days=direction)
        return running_date

    @classmethod
    def is_working_day(self, user, date):
        return self.num_non_working_days_in_range(user, date, date) == 0
     
    @classmethod
    def num_non_working_days_in_range(self, user, date_from_inclusive, date_to_inclusive):

        weekends = [ x.date() for x in date_helper.daterange(date_from_inclusive, date_to_inclusive)
                          if calendar.weekday(year=x.year, month=x.month, day=x.day)>=5 ]
        
        holidays_in_range = Holiday.holidays_in_range(date_from_inclusive, date_to_inclusive)\
                            .exclude(applies_on__in=weekends)
        events = self.objects.filter(user=user,
                                     start__gte=date_from_inclusive,
                                     start__lte=date_to_inclusive,
                                     event_type__in=self.NON_WORKING_EVENT_TYPES)\
                             .exclude(start__in=holidays_in_range.values_list("applies_on", flat=True))\
                             .exclude(start__date__in=weekends)

        num_events = events.count()
        num_holidays = holidays_in_range.count()

        return num_events + num_holidays + len(weekends)
                             
    
    @property
    def end(self):
        return self.start + datetime.timedelta(hours=float(self.hours))

    @property
    def is_open(self):
        return self.status == '' or self.status == 'ready'

    @classmethod
    def is_on_leave(self, d, user):
        return self.objects.filter(user=user, start=d, event_type__in=self.cant_work_event_types(), status__in=['ready', 'done', 'CONFIRMED']).count()>0

    @classmethod
    def cant_work_event_types(self):
        return [ 'leave', 'sickday', 'office_closed' ]

    @classmethod
    def event_did_happen_states(self):
        return [ 'ready', 'done', 'CONFIRMED' ]
        
    
    def get_colour(self):
        index = self.user_id % len(COLOURS)
        threshold = int("0x999999", 0)
        c = COLOURS[index]
        c_int = int("0x"+c[1:], 0)
        if c_int < threshold:
            c_int = c_int * 2
            c = "#"+hex(c_int)[2:]
        return c

    def __unicode__(self):
        return "Starts at %s, ends at %s \n%s " % (self.start.strftime('%d %B %Y %H:%M'), self.end.strftime('%d %B %Y %H:%M'), self.description)

class BaseChecklist(BaseModel):
    class Meta:
        abstract=True

    business = models.ForeignKey(Business, null=False, blank=True, db_index=True)

    # is_projected_cost_in_budget = models.BooleanField(default=False, blank=True, verbose_name="is the projected cost within budget?")
    # all_invoices_sent = models.BooleanField(default=False, blank=True, verbose_name="xxx?")
    # all_sprints_closed = models.BooleanField(default=False, blank=True, verbose_name="xxx?")

    comments = models.TextField(null=True, blank=True)
    passed = models.BooleanField(default=False, blank=True, db_index=True)

    def __unicode__(self):
        return "%s %s" % (self.created_by, self.created_at)

    @classmethod
    def get_todays_checklist(self, logged_in_user, business):
        checklist = self.objects.filter(business=business,
                                        created_at__gte=datetime.datetime.today().date(),
                                        created_at__lt=(datetime.datetime.today()+relativedelta(days=1)).date).order_by("-pk").first()
        if checklist is None:
            checklist = self.objects.create(business=business, created_at=datetime.datetime.today(),
                                            created_by=logged_in_user, modified_by=logged_in_user)
            checklist.recalculate_all()
        return checklist


    def is_ok(self):
        return self.passed

class BaseChecklistItem(BaseModel):
    class Meta:
        abstract=True

    name = models.CharField(max_length=255, null=False, blank=False)
    passed = models.BooleanField(default=False, blank=True)
    msg = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    issue = models.ForeignKey(Issue, null=True, blank=True)
    project = models.ForeignKey(Project, null=True, blank=True, db_index=True)

class TrafficChecklist(BaseChecklist):

    # have_made_new_staging_release_today = models.BooleanField(default=False, blank=True, verbose_name="has there been a new release to the client's staging server today?")
    # has_incoming_issues_created = models.BooleanField(default=False, blank=True, verbose_name="have issues been created for all client emails (for this project), and are they in the 'incoming' sprint?")
    # is_requote_required = models.BooleanField(default=False, blank=True, verbose_name="have any changes to existing sprints, which may have caused a re-quote to be required, been reviewed?")
    # have_pending_requotes_been_sent = models.BooleanField(default=False, blank=True, verbose_name="have any pending re-quotes been sent?")
    # is_quote_required = models.BooleanField(default=False, blank=True, verbose_name="are there any quotes on this new sprint which need to be sent?")
    # have_all_new_quotes_been_sent = models.BooleanField(default=False, blank=True, verbose_name="have all quotes for new sprints been sent?")
    # has_existing_quotes_waiting_for_acceptance = models.BooleanField(default=False, blank=True, verbose_name="are there any existing quotes for this project which are waiting for acceptance?")
    # has_existing_quoted_accepted = models.BooleanField(default=False, blank=True, verbose_name="have all existing quotes for this project been accepted?")
    # has_sprints_to_invoice = models.BooleanField(default=False, blank=True, verbose_name="can any sprints be invoiced?")
    # has_issues_for_testing = models.BooleanField(default=False, blank=True, verbose_name="are there issues which can be tested?")
    # is_deadline_clear_to_client = models.BooleanField(default=False, blank=True, verbose_name="is the deadline clear with the client?")
    # has_communicated_with_client_this_week = models.BooleanField(default=False, blank=True, verbose_name="has the client had any communication during this week?")
    # all_calendar_entries_assigned_per_developer = models.BooleanField(default=False, blank=True, verbose_name="is the total required time per developer assigned to the calendar for this sprint?")

    created_by = models.ForeignKey(User, null=False, blank=False, related_name='traffic_checklist_created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(User, null=False, blank=True, related_name='traffic_checklist_modified_by')


    def is_ok(self):
        return super(TrafficChecklist, self).is_ok() and self.created_at > datetime.datetime.today()-timedelta(days=settings.NUM_DAYS_FOR_TRAFFIC_SPRINT_CHECKLISTS)

    def recalculate_all(self):
        self.items.all().delete()
        num_problems = 0
        for plugin in get_traffic_plugins(self.business):
            for problem in (plugin.check_for_problems() or []):
                TrafficChecklistItem.objects.create(traffic_checklist=self, name=plugin.name,
                                                    passed=False, msg=problem['msg'],
                                                    issue=problem['issue'],
                                                    project=problem['project'])
                num_problems += 1
        self.passed = (num_problems==0)
        self.save()

class TrafficChecklistItem(BaseChecklistItem):
    traffic_checklist = models.ForeignKey(TrafficChecklist, null=False, blank=True, db_index=True, related_name="items")

class DevChecklist(BaseChecklist):

    # has_reviewed_previous_days_issues = models.BooleanField(default=False, blank=True, verbose_name="Were yesterday's issues reviewed?")
    # has_reviewed_description_for_todays_issues = models.BooleanField(default=False, blank=True, verbose_name="Have the descriptions for todays issues been reviewed with the developer?")
    # are_the_estimates_consistently_over = models.BooleanField(default=False, blank=True, verbose_name="xxx?")
    # has_incoming_issues_created = models.BooleanField(default=False, blank=True, verbose_name="All issues from emails are created")
    # have_incoming_issues_beenallocated = models.BooleanField(default=False, blank=True, verbose_name="have all previous issues from the incoming sprint been allocated to an actual sprint?")
    # has_sprints_to_invoice = models.BooleanField(default=False, blank=True, verbose_name="if sprints are closed, they should be set to?")

    created_by = models.ForeignKey(User, null=False, blank=False, related_name='dev_checklist_created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(User, null=False, blank=True, related_name='dev_checklist_modified_by')

    def is_ok(self):
        return super(DevChecklist, self).is_ok() and self.created_at > datetime.datetime.today()-timedelta(days=settings.NUM_DAYS_FOR_DEV_SPRINT_CHECKLISTS)

    def recalculate_all(self):
        self.items.all().delete()
        num_problems = 0
        for plugin in get_dev_plugins(self.business):
            for problem in (plugin.check_for_problems() or []):
                DevChecklistItem.objects.create(dev_checklist=self, name=plugin.name,
                                                passed=False, msg=problem['msg'],
                                                issue=problem['issue'],
                                                project=problem['project'])
                num_problems += 1
        self.passed = (num_problems==0)
        self.save()

class DevChecklistItem(BaseChecklistItem):
    dev_checklist = models.ForeignKey(DevChecklist, null=False, blank=True, db_index=True, related_name="items")

class FinanceChecklist(BaseChecklist):

    created_by = models.ForeignKey(User, null=False, blank=False, related_name='finance_checklist_created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(User, null=False, blank=True, related_name='finance_checklist_modified_by')

    def is_ok(self):
        return super(FinanceChecklist, self).is_ok() and self.created_at > datetime.datetime.today()-timedelta(days=settings.NUM_DAYS_FOR_FINANCE_SPRINT_CHECKLISTS)

    def recalculate_all(self):
        self.items.all().delete()
        num_problems = 0
        for plugin in get_finance_plugins(self.business):
            for problem in (plugin.check_for_problems() or []):
                FinanceChecklistItem.objects.create(finance_checklist=self, name=plugin.name,
                                                    passed=False, msg=problem['msg'],
                                                    issue=problem['issue'],
                                                    project=problem['project'])
                num_problems += 1
        self.passed = (num_problems==0)
        self.save()

class FinanceChecklistItem(BaseChecklistItem):
    finance_checklist = models.ForeignKey(FinanceChecklist, null=False, blank=True, db_index=True, related_name="items")

class UserNotification(BaseModel):
	user = models.ForeignKey(User, related_name='notifications')
	notification_type = models.CharField(max_length=50, null=False, blank=False,
										 choices=( ("daily_calendar", "Daily Calendar"), ("planned_for_today", "Planned for today") ))
	applies_on = models.DateField(blank=True, null=True)
	msg = models.TextField(null=True, blank=True)
	seen = models.BooleanField(default=False)

	@classmethod
	def create_graph_notification(self, user, force=False):
		if force:
			UserNotification.objects.create(user=user, notification_type="daily_calendar", applies_on=datetime.datetime.today().date(),
											seen=False)
		else:
			UserNotification.objects.get_or_create(user=user, notification_type="daily_calendar", applies_on=datetime.datetime.today().date(),
												   defaults={'seen':False})

	@classmethod
	def create_default_notifications(self, user):
		UserNotification.objects.get_or_create(user=user, notification_type="planned_for_today", applies_on=datetime.datetime.today().date(),
											   defaults={'seen':False})

	def user_graph_from_date(self):
		return self.user_graph_to_date() - relativedelta(days=14)

	def user_graph_to_date(self):
		return datetime.datetime.today().date()

	def get_hours_for_user_graph(self):
		to_date = self.user_graph_to_date()
		from_date = self.user_graph_from_date()
		hours = {}
		entries = Entry.objects.filter(user=self.user).order_by("start_time").filter(start_time__gte=from_date, end_time__lte=to_date)

		for entry in entries:
			d = entry.start_time.date()
			if from_date and to_date:
				if from_date > d or to_date < d: continue
			elif from_date:
				if from_date > d: continue
			elif to_date:
				if to_date < d: continue
			if d not in hours:
				hours[d] = entry.hours
			else:
				hours[d] += entry.hours

		hours = sorted(hours.iteritems())
		return hours

	def get_planned_events_for_today(self):
		return CalendarEvent.objects.filter(user=self.user, start__gte=datetime.datetime.today().date(), start__lt=datetime.datetime.today().date()+relativedelta(days=1)).order_by("start")


class Holiday(BaseModel):
    applies_on = models.DateField(blank=True, null=True)
    name = models.CharField(max_length=100, default='public holiday', null=False, blank=True)

    @classmethod
    def is_a_holiday(self, d):
        return d.weekday() in [5,6] or self.objects.filter(applies_on=d).count() > 0

    @classmethod
    def holidays_in_range(self, date_from_inclusive, date_to_inclusive):
        return Holiday.objects.filter(applies_on__gte=date_from_inclusive,
                                      applies_on__lte=date_to_inclusive)
    
    @classmethod
    def business_days_in_range(self, date_from_inclusive, date_to_inclusive):
        """ this function only know about holidays. to include user's personal leave etc, use CalendarEvent """
        holiday_dates = Holiday.objects.filter(applies_on__gte=date_from_inclusive,
                                               applies_on__lte=date_to_inclusive)\
                                               .values('applies_on')
        holiday_days = [x['applies_on'] for x in holiday_dates]
        business_days = [ x for x in date_helper.daterange(date_from_inclusive, date_to_inclusive)
                          if calendar.weekday(year=x.year, month=x.month, day=x.day)<5 and x.date() not in holiday_days ]
        return business_days
    
    @classmethod
    def business_days_in_month(self, d):
        return self.business_days_in_range(datetime.datetime(d.year, d.month, 1),
                                           datetime.datetime(d.year, d.month+1, 1)-relativedelta(days=1))

class ScheduleQuerySet(QuerySet):
    def hours_for_user(self, user_id):
        return self.filter(user_id=user_id).aggregate(num_hours=Sum('num_hours'))['num_hours']

    def hours_for_business(self, business_id):
        return self.filter(business_id=business_id).aggregate(num_hours=Sum('num_hours'))['num_hours']

    def hours(self):
        return self.aggregate(num_hours=Sum('num_hours'))['num_hours']

    def billable_for_user(self, user_id):
        schedules = self.filter(user_id=user_id)
        total = 0
        for schedule in schedules.values('business_id', 'num_hours'):
            rate = Rate.for_business(user_id, schedule['business_id'])
            if rate is not None:
                total += rate.full_rate * schedule['num_hours']
        return total

    def billable_for_business(self, business_id):
        schedules = self.filter(business_id=business_id)
        total = 0
        for schedule in schedules.values('user_id', 'num_hours'):
            rate = Rate.for_business(schedule['user_id'], business_id)
            if rate is not None:
                total += rate.full_rate * schedule['num_hours']
        return total

    def billable(self):
        schedules = self
        total = 0
        for schedule in schedules.values('user_id', 'num_hours', 'business'):
            rate = Rate.for_business(schedule['user_id'], schedule['business'])
            if rate is not None:
                total += rate.full_rate * schedule['num_hours']
        return total


class Schedule(BaseModel):
    business = models.ForeignKey('business', null=False, blank=False)
    scheduled_date = models.DateField(null=False, blank=False)
    num_hours = models.IntegerField(null=False, blank=False)
    user = models.ForeignKey(User, related_name='schedules')

    objects = ScheduleQuerySet.as_manager()

    @classmethod
    def available_business_hours(self, year, month, user):
        date_from = datetime.datetime(year=year, month=month, day=1)
        date_to = date_from + relativedelta(months=1)
        num_days = len(Holiday.business_days_in_month(date_from))
        leave_days = CalendarEvent.objects.filter(start__gte=date_from, start__lt=date_to,
                                                  user=user, status__in=['ready', 'done'],
                                                  event_type__in=CalendarEvent.cant_work_event_types()).count()
        num_days -= leave_days
        return { 'num_hours': num_days * settings.NUM_BUSINESS_HOURS_PER_DAY,
                 'leave_hours': leave_days * settings.NUM_BUSINESS_HOURS_PER_DAY }

    @classmethod
    def available_hours(self, year, month, users):
        date_from = datetime.datetime(year=year, month=month, day=1)
        date_to = date_from + relativedelta(months=1)
        num_days = len(Holiday.business_days_in_month(date_from)) * users.count()
        leave_days = CalendarEvent.objects.filter(start__gte=date_from, start__lt=date_to,
                                                  status__in=['ready', 'done'],
                                                  user__in=users,
                                                  event_type__in=CalendarEvent.cant_work_event_types()).count()
        num_days -= leave_days
        return { 'num_hours': num_days * settings.NUM_BUSINESS_HOURS_PER_DAY,
                 'leave_hours': leave_days * settings.NUM_BUSINESS_HOURS_PER_DAY }


class ProjectDeadlineType(BaseModel):
    DEFAULT_PROJECT_DEADLINE_TYPES = ( ('start_dev', 'Start development'),
                                       ('start_internal_qa', 'Start internal QA'),
                                       ('end_external_qa', 'End external QA') )

    business = ProtectedForeignKey(Business, related_name='deadline_types')
    name = models.CharField(max_length=100, null=False)


    class Meta:
        unique_together = ('name', 'business')


class ProjectDeadline(BaseModel):
    project = ProtectedForeignKey(Project, null=False, related_name='deadlines')
    deadline_type = ProtectedForeignKey(ProjectDeadlineType, null=False)
    deadline = models.DateTimeField(null=True)
    description = models.TextField(null=True)
    is_hard_deadline = models.BooleanField()
    represents_project_start = models.BooleanField()
    represents_project_end = models.BooleanField()

    class Meta:
        ordering = ('deadline',)

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(ProjectDeadline, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self, params={'sprint_id': self.project_id})
        else:
            RefreshNotifier().notify_model_update(self, params={'sprint_id': self.project_id})

class ProjectReview(BaseModel):
    project = ProtectedForeignKey(Project, null=False, related_name='reviews')
    review_cycle_days = models.IntegerField(null=False)
    review_by = models.ForeignKey(User, related_name='project_reviews', null=False)
    must_always_review = models.BooleanField(default=False)

    class Meta:
        unique_together = (('project', 'review_by'),)

    @classmethod
    def filter_has_an_issue_due_for_review(self, project_qs):
        now = timezone.now()
        project_qs = project_qs.filter(reviews__must_always_review=True,
                                       issues__reviews__last_reviewed_at__lt=now-timedelta(days=1)*F('reviews__review_cycle_days'))\
                               .distinct()
        return project_qs
        
    def save(self, *args, **kwargs):
        was_created = not self.id
        super(ProjectReview, self).save(*args, **kwargs)
        IssueReview.refresh_for_project(self.project)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

class IssueReview(BaseModel):
    issue = models.ForeignKey(Issue, null=False, related_name='reviews')
    last_reviewed_at = models.DateTimeField(null=True, db_index=True)
    reviewed_by = models.ForeignKey(User, related_name='issue_reviews', null=False)

    class Meta:
        ordering = ('last_reviewed_at',)

    def save(self, *args, **kwargs):
        was_created = not self.id
        super(IssueReview, self).save(*args, **kwargs)
        if was_created:
            RefreshNotifier().notify_model_create(self)
        else:
            RefreshNotifier().notify_model_update(self)

    def get_review_due_dates(self):
        due_dates = []
        for project_review in ProjectReview.objects.filter(project_id=self.issue.project_id).order_by("review_by__username"):
            due_dates.append({'user_id': project_review.review_by_id,
                              'review_at': IssueReview.get_next_due_date_for_review(self.issue, project_review.review_by)})
        return due_dates

    @classmethod
    def get_next_due_date_for_review(self, issue, user):
        project_review = ProjectReview.objects.filter(project=issue.project,
                                                      review_by=user).first()
        if project_review is None:
            return None

        if not project_review.must_always_review:
            issue_review = IssueReview.objects.filter(issue=issue).order_by("-last_reviewed_at").first()
        else:
            issue_review = IssueReview.objects.filter(issue=issue, reviewed_by=user).first()

        if issue_review is None:
            last_reviewed_at = issue.created
        else:
            last_reviewed_at = issue_review.last_reviewed_at

        return last_reviewed_at + relativedelta(days=project_review.review_cycle_days)

    @classmethod
    def refresh_for_project(self, project):
        # Hook that indicates the project's review settings have changed.
        pass

    @classmethod
    def reviewed(self, issue, logged_in_user):
        review = IssueReview.objects.get_or_create(issue=issue, reviewed_by=logged_in_user)[0]
        review.last_reviewed_at = timezone.now()
        review.save()
