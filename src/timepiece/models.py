
import datetime
import uuid
from colorful.fields import RGBColorField
from interface_plugin import get_interface_plugin
import re
import logging
from decimal import Decimal
from model_managers import QuerySetManager
from django.db.models import Count
from django.db.models.query import QuerySet
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError, NON_FIELD_ERRORS
from django.db import models
from django.db.models import Q, Avg, Sum, Max, Min
from django.utils.datastructures import SortedDict
from re import sub as re_sub
from re import UNICODE as re_UNICODE

try:
    from django.utils import timezone
except ImportError:
    from timepiece import timezone

from timepiece import utils

from dateutil.relativedelta import relativedelta
from dateutil import rrule

from datetime import timedelta

ISSUE_DEV_COMPLETED_STATES = ["devdone", "dev done", "tested"]

class Attribute(models.Model):
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
        if user.is_superuser:
            return self
        return self.filter(new_business_projects__users=user)

class Business(models.Model):
    class Meta:
        ordering = ('name',)
        
    name = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    email = models.EmailField(blank=True)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    external_id = models.CharField(max_length=32, blank=True)
    objects = QuerySetManager(BusinessQuerySet)
    sync_with = models.CharField( max_length=100, blank=True, null=True, choices=( ("jira", "Jira"), ) )

    def get_ordered_projects(self):
        all_business_projects = Project.objects.filter(business=self)
        
        orderless_projects = all_business_projects.filter(order__isnull=True).order_by("-id")
        ordered_projects = all_business_projects.exclude(order__isnull=True).order_by("order")
        
        if len(orderless_projects) > 0:
            all_projects = [ project for project in orderless_projects ] + [project for project in ordered_projects]
            for index, project in enumerate(all_projects):
                project.order = index
                project.save()

        return Project.objects.filter(business=self).order_by("order")

    def get_users_allowed_to_estimate_on_business(self, current_user):
        business_permissions_by_user = BusinessPermissions.by_user(self)
        bp = BusinessPermissions.objects.get_or_create(business=self,user=current_user)[0]
        can_view_other_user_points = BusinessPermissions.has_see_other_user_points
        if can_view_other_user_points:
            users = User.objects.filter(id__in = business_permissions_by_user.keys())
            users = [user for user in users if business_permissions_by_user[user.id].has_estimate_own_points]
        else:
            if bp.has_estimate_own_points:
                users = User.objects.filter(id__in = [current_user.id])
            else:
                users = User.objects.none()
        return users

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
        user_ids =  Project.objects.filter(business__id = self.id).values_list("users", flat=True)
        user_ids = [user_id for user_id in user_ids if user_id is not None]
        user_ids = list(set(user_ids))
        return_users = []
        for user_id in user_ids:
            return_users.append(User.objects.get(id=user_id))
        return return_users

    def ensure_single_sprint(self, **kwargs):
        kwargs = kwargs or {}
        kwargs.update({"name":"Sprint0",
                       "business":self ,
                       "type":Attribute.objects.get(label="default"),
                       "status":Attribute.objects.get(label="open"),
                       })

        if len(Project.objects.filter(business = self)) == 0:
            return Project.objects.create(**kwargs);

    def save(self, *args, **kwargs):
        queryset = Business.objects.all()
        if not self.slug:
            if self.id:
                queryset = queryset.exclude(id__exact=self.id)
            self.slug = utils.slugify_uniquely(self.name, queryset, 'slug')
        super(Business, self).save(*args, **kwargs)
        
    @classmethod
    def businesses_in_desc_order_of_use(self, user):
        businesses = Business.objects.annotate(models.Min("new_business_projects__entries__end_time")).order_by("-new_business_projects__entries__end_time__min")
        business_ids = []
        for business in businesses:
            if BusinessPermissions.objects.get_or_create(business=business,user=user)[0].has_view_project_card:
                business_ids.append(business.id)
        businesses = businesses.filter(id__in=business_ids)
        return businesses

    def __unicode__(self):
        return self.name

    @property
    def end_time(self):
        entries = Entry.objects.filter(project__business=self).order_by("-end_time")
        if entries.count()>0:
            return entries[0].end_time
        else:
            return None


class Feature(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    business = models.ForeignKey(Business,related_name='features')

    class Meta:
        unique_together = (('name', 'business'), )

    def __unicode__(self):
        return self.name

class BusinessPermissions(models.Model):

    class Meta:
        unique_together = (('user','business'),)

    business = models.ForeignKey(Business, related_name='business_permissions')
    user = models.ForeignKey(User, related_name='business_permissions')

    can_view_project_card = models.BooleanField(default=True, verbose_name="Can View Sprint Card")
    can_edit_issues = models.BooleanField(default=True, verbose_name="Can Edit Issues")
    can_view_issues = models.BooleanField(default=True, verbose_name="Can View Issues")
    can_edit_issue_states = models.BooleanField(default=True, verbose_name="Can Edit Issue States")
    can_add_issue = models.BooleanField(default=True, verbose_name="Can Add Issue")
    can_delete_issue = models.BooleanField(default=True, verbose_name="Can Delete Issue")
    can_edit_description = models.BooleanField(default=True, verbose_name="Can Edit Description")
    can_add_issue_comment = models.BooleanField(default=True, verbose_name="Can Add Issue Comment")
    can_edit_subject = models.BooleanField(default=True, verbose_name="Can Edit Subject")
    can_edit_feature = models.BooleanField(default=True, verbose_name="Can Edit Feature")
    can_create_sprint = models.BooleanField(default=True, verbose_name="Can Create Sprint")
    can_assign_user = models.BooleanField(default=True, verbose_name="Can Assign User")

    can_view_actual_hours = models.BooleanField(default=False, verbose_name="Can View Actual Hours")
    can_see_other_user_points = models.BooleanField(default=False, verbose_name="Can See Other User's Points")
    can_estimate_own_points = models.BooleanField(default=False, verbose_name="Can Estimate Own Points")

    can_edit_permissions = models.BooleanField(default=False, verbose_name="Can Edit Permissions")
    can_toggle_graphs = models.BooleanField(default=False, verbose_name="Can Toggle Graphs")
    can_edit_project_detail = models.BooleanField(default=False, verbose_name="Can Edit Sprint Detail")
    can_edit_budget = models.BooleanField(default=False,verbose_name = "Can Edit Budget ")
    can_view_budget = models.BooleanField(default=False, verbose_name="Can View Budget")
    can_edit_invoices = models.BooleanField(default=False, verbose_name="Can Edit Invoices")
    can_view_invoices = models.BooleanField(default=False, verbose_name="Can View Invoices")
    can_edit_ctc_billable_rates = models.BooleanField(default=False, verbose_name="Can Edit Ctc Billable")
    can_view_ctc_billable_rates = models.BooleanField(default=False, verbose_name="Can View Ctc Billable")
    can_view_ctc_rates = models.BooleanField(default=False, verbose_name="Can View Ctc") # a subpermission of can_view_ctc_billable_rates, used for clients who shouldn't see our internal costing.
    can_view_documents = models.BooleanField(default=False, verbose_name="Can View Docs") # quotes and summaries, usually contains costs and rates
    
    @classmethod
    def by_user(self, business):
        bps = BusinessPermissions.objects.filter(business=business)
        return dict( [ (bp.user.id, bp) for bp in bps ] )

    @classmethod
    def for_user(self, user, business):
        return BusinessPermissions.objects.get_or_create(business=business,user=user)[0]

    @property
    def has_view_project_card(self):
        return self.user.is_superuser or self.can_view_project_card

    @property
    def has_edit_permissions(self):
        return self.user.is_superuser or self.can_edit_permissions

    @property
    def has_edit_project_detail(self):
        return self.user.is_superuser or self.can_edit_project_detail

    @property
    def has_edit_issues(self):
        return self.user.is_superuser or self.can_edit_issues
    @property
    def has_view_issues(self):
        return self.user.is_superuser or self.can_view_issues
    
    @property
    def has_edit_budget(self):
        return self.user.is_superuser or self.can_edit_budget
    @property
    def has_view_budget(self):
        return self.user.is_superuser or self.can_view_budget
    
    @property
    def has_edit_invoices(self):
        return self.user.is_superuser or self.can_edit_invoices
    @property
    def has_view_invoices(self):
        return self.user.is_superuser or self.can_view_invoices
    
    @property
    def has_edit_ctc_billable_rates(self):
        return self.user.is_superuser or self.can_edit_ctc_billable_rates
    @property
    def has_view_ctc_billable_rates(self):
        return self.user.is_superuser or self.can_view_ctc_billable_rates

    @property
    def has_view_ctc_rates(self):
        return self.user.is_superuser or self.can_view_ctc_rates

    @property
    def has_view_actual_hours(self):
        return self.user.is_superuser or self.can_view_actual_hours

    @property
    def has_toggle_graphs(self):
        return self.user.is_superuser or self.can_toggle_graphs
    @property
    def has_edit_issue_states(self):
        return self.user.is_superuser or self.can_edit_issue_states

    @property
    def has_see_other_user_points(self):
        return self.user.is_superuser or self.can_see_other_user_points
    
    @property
    def has_estimate_own_points(self):
        return self.can_estimate_own_points
    
    @property
    def has_add_issue(self):
        return self.user.is_superuser or self.can_add_issue
    @property
    def has_delete_issue(self):
        return self.user.is_superuser or self.can_delete_issue

    @property
    def has_edit_description(self):
        return self.user.is_superuser or self.can_edit_description

    @property
    def has_add_issue_comment(self):
        return self.user.is_superuser or self.can_add_issue_comment

    @property
    def has_edit_subject(self):
        return self.user.is_superuser or self.can_edit_subject

    @property
    def has_edit_issue_feature(self):
        return self.user.is_superuser or self.can_edit_feature

    @property
    def has_create_sprint(self):
        return self.user.is_superuser or self.can_create_sprint

    @property
    def has_assign_user(self):
        return self.user.is_superuser or self.can_assign_user

    @property
    def has_view_documents(self):
        return self.user.is_superuser or self.can_view_documents


class ProjectQuerySet(QuerySet):
    def filter_by_logged_in_user(self, user):
        """ restricts entries to those belonging to projects the given
        user (typically the logged in user) is assigned to """
        if user.is_superuser:
            return self
        return self.filter(business__business_permissions__user=user, business__business_permissions__can_view_project_card=True)

class Project(models.Model):

    code = models.CharField(max_length=255,blank=True,null=True)        
    name = models.CharField(max_length=255, db_index=True)
    budget = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    tracker_url = models.CharField(max_length=255, blank=True, null=False,
        default="")
    business = models.ForeignKey(
        "Business",
        related_name='new_business_projects',
    )
    billable = models.BooleanField(default=False)
    point_person = models.ForeignKey(User, limit_choices_to={'is_staff': True})
    quote_uncertainty = models.FloatField(null=True, blank=True, default=0.25)
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
    )
    status = models.ForeignKey(
        Attribute,
        limit_choices_to={'type': 'project-status'},
        related_name='projects_with_status',
    )
    description = models.TextField(blank=True, null=True, db_index=True)
    short_description = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    order = models.IntegerField(null=True,blank=True)
    objects = QuerySetManager(ProjectQuerySet)
    interface_plugin_number = models.CharField(max_length=255, null=True, blank=True) #eg jira

    colour = RGBColorField(null=True, blank=True)

    @classmethod
    def get_or_create_project(self, business, project_name, description=None, short_description=None):
        description = "%s %s" % (project_name, (description or ""))
        point_person = User.objects.get_or_create(username="auto")[0]
        try:
            project_status = Attribute.objects.get(type='project-status', label='open')
        except: 
            project_status = Attribute.objects.create(type='project-status', label='open', billable=True, enable_timetracking=True)
        try:
            project_type = Attribute.objects.get(type='project-type', label='default')
        except:
            project_type = Attribute.objects.create(type='project-type', label='default', billable=True, enable_timetracking=True)

        try:
            project = Project.objects.get(name=project_name, business=business)
        except Project.DoesNotExist:
            project = Project.objects.create(name=project_name, business=business, 
                                             point_person=point_person,
                                             status=project_status, type=project_type,
                                             description=description,
                                             short_description=short_description)
        return project

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
            rate = Rate.objects.filter(project=self, user=user).order_by("user__id")[0]
            return rate


    def __init__(self, *args, **kwargs):
        super(Project, self).__init__(*args, **kwargs)
        self._stats = None
        self._estimate_stats = None
        self._users_and_hours = None

    @property
    def has_budget(self):
        return self.budget>0

    @property
    def all_invoices_paid(self):
        for invoice in Invoice.objects.filter(project=self):
            if not invoice.paid:
                return False
        return True

    @property
    def has_invoices(self):
        return Invoice.objects.filter(project=self).count() > 0

    @property
    def next_issue_number(self):
        return Issue.objects.filter(project__business=self.business).aggregate(n=Max('number'))['n']+1
    
    @classmethod
    def get_project_from_name(self, name, business):
        project_id = None
        match_object = re.compile("[sS]print#(\d+).*").search(name)
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

    def save(self, *args, **kwargs):
        
        self.code = Project.get_code_from_name(self.name)

        if not self.id and Project.objects.filter(code=self.code,business=self.business).count()>0:
            raise Exception("A Project with code %s already exists" % self.code)

        super(Project, self).save(*args, **kwargs)

        # Add all users from other projects in this business
        users = User.objects.filter(user_projects__business=self.business).distinct()
        for user in users:
            ProjectRelationship.objects.get_or_create(user=user, project=self)
            UserProfile.objects.get_or_create(user=user)
            user.save()

        projects = Project.objects.filter(business=self.business).order_by('pk')
        if projects and projects.count() > 1:
            last_project = projects[projects.count() - 2] #last project is this one
        else:
            last_project = None

        for user in users:
            last_rate = None
            if last_project:
                try:
                    last_rate = Rate.objects.get(project=last_project, user=user)
                except Rate.DoesNotExist:
                    pass
                except Rate.MultipleObjectsReturned:
                    last_rate = Rate.objects.filter(project=last_project, user=user)[0]
                    Rate.objects.filter(project=last_project, user=user).exclude(pk=last_rate.id).delete()
                    
            rate, newly_created = Rate.objects.get_or_create(project=self, user=user)
            if newly_created:
                rate.amount = last_rate.amount if last_rate else user.profile.amount
                rate.billable_amount = last_rate.billable_amount if last_rate else user.profile.billable_amount
                rate.work_ratio = last_rate.work_ratio if last_rate else 0
                rate.velocity = last_rate.velocity if last_rate else 0
                rate.save()

    @classmethod
    def projects_in_desc_order_of_use(self, business_id):
        entries = Entry.objects.filter(project__business_id=business_id).order_by('-end_time').values('project_id')
        p = SortedDict()
        for entry in entries:
            if entry['project_id'] not in p:
                p[entry['project_id']] = Project.objects.get(pk=entry['project_id'])
        return p.values()

    def costs_by_feature(self):
        
        if hasattr(self, '_cached_billable_by_feature'):
            return self._cached_billable_by_feature

        costs_per_feature = SortedDict()
        features_in_project = list(self.issues.all().filter(feature__isnull=False).order_by('feature').values('feature').annotate(x=Count('feature'))) + [{'feature':None,'x':0}]
        for feature in features_in_project:
            entries_qs = Entry.objects.all().filter(project=self)
            if feature['feature'] is None:
                cost_per_feature = costs_per_feature.setdefault('none', {'name':'no feature', 'ctc':0,'billable':0})
                entries_qs = entries_qs.filter(Q(issue__isnull=True)|Q(issue__feature__isnull=True))
            else:
                cost_per_feature = costs_per_feature.setdefault(feature['feature'], {'name':Feature.objects.get(pk=feature['feature']), 'ctc':0,'billable':0})
                entries_qs = entries_qs.filter(issue__feature_id=feature['feature'])

            user_totals = entries_qs.values("user").annotate(hours=Sum('hours'))
            for user_total in user_totals:
                user = User.objects.get(pk=user_total['user'])
                try:
                    rate = Rate.objects.get(project=self, user=user)
                except Rate.DoesNotExist:
                    rate = Rate.objects.create(project=self, user=user, amount=0)
                cost_per_feature['ctc'] += float(user_total['hours'])*float(rate.amount)
                cost_per_feature['billable'] += float(rate.billable_amount) * float(user_total['hours'])

        self._cached_billable_by_feature = costs_per_feature
        return self._cached_billable_by_feature

    @classmethod
    def most_recent_project(self, business_id):
        entries_per_business_ids = Entry.objects.filter(project__business_id=business_id).order_by('-end_time').values('project_id') 
        project_returned = None
        
        if len(entries_per_business_ids) != 0:
            project_id = entries_per_business_ids[0]['project_id']
            
            try:
                project_returned = Project.objects.get(pk=project_id)            
            except Project.DoesNotExist:
                project_returned = None

        if not project_returned: 
            qs = Project.objects.filter(business__id=business_id).order_by("-id")
            project_returned = qs[0] if len(qs) > 0 else None

        return project_returned

    def close(self):
        self.status = Attribute.objects.get(label='closed', type='project-status')
        self.save()

    def open(self):
        self.status = Attribute.objects.get(label='open', type='project-status')
        self.save()

    @property
    def is_open(self):
        manually_closed = not(self.status.label == 'open' or self.status.label == "reopened")
        if manually_closed:
            return False
        closed_because_paid = self.has_invoices and self.all_invoices_paid
        if closed_because_paid:
            return False
        return True

    def estimate_stats(self, issues, preferred_user_id):

        if self._estimate_stats is not None:
            return self._estimate_stats
        stats = {'issues':[], 'users':{}, 'features':{}}
        self._estimate_stats = stats

        estimate_cost = 0
        for issue in issues:
            points = issue.issue_points.get_query_set().all().filter(user__id=preferred_user_id).values('points', 'user')
            if len(points) == 0 or points[0]['points'] is None:
                points = issue.issue_points.get_query_set().all().values('points', 'user')
            if len(points) == 0 or points[0]['points'] is None:
                points = 0
                user_id = None
            else:
                user_id = points[0]['user']
                points = points[0]['points']

            if user_id is not None:
                try:
                    rate = Rate.objects.get(project=self, user_id=user_id)
                except Rate.DoesNotExist:
                    rate = Rate.objects.create(project=self, user_id=user_id, amount=0)
            else:
                rate = Rate(velocity=0, work_ratio=0, amount=0)

            points = points * (rate.velocity or 1)
            points = points / (rate.work_ratio or 1)

            min_cost = float(points)*float(rate.billable_amount)

            stats['issues'].append( { 'issue':issue,
                                      'points':points,
                                      'user_id':user_id,
                                      'min_cost':min_cost} )

            if user_id is not None and user_id not in stats['users']:
                user = User.objects.get(pk=user_id)
                stats['users'][user_id] = {'user':user,
                                           'rate':rate.billable_amount,
                                           'velocity_adjusted_rate':float(rate.velocity)*float(rate.billable_amount),
                                           'work_ratio':rate.work_ratio}

            feature = issue.feature
            if feature is None:
                feature = "na"
            if feature not in stats['features']:
                stats['features'][feature] = 0
            stats['features'][feature] += min_cost

            estimate_cost += min_cost

        stats['total_estimate_min'] = estimate_cost
        stats['total_estimate_max'] = estimate_cost * (1+self.slack_percentage)
        stats['slack_percentage'] = self.slack_percentage*100
        return stats

    def users_and_hours(self):
        return self._get_users_and_hours({'entries':Entry.objects.filter(project=self)})

    def cache_stats(self, start=None, end=None):
        stats = {}
        entries = Entry.objects.filter(project=self)

        issues = self.issues
        if start is not None:
            entries = entries.filter(start_time__gte=start).filter(end_time__lte=end)
            issues_with_time_entries = issues.filter(entries__in=entries).distinct()
            issues = issues_with_time_entries
        else:
            issues_with_time_entries = issues.all()

        ctc = 0
        billed = 0

        # The 'or 1' clause is so that if the project has no estimates, the ratios still have some meaning.
        number_dev_done = lambda issues_qs : 1.0*sum([ (ii or 1) for ii in  [i[0] for i in issues_qs.filter(Q(status__icontains='dev done')|Q(status__icontains='devdone')|Q(status__icontains="cannot reproduce")).values_list('story_points')]])
        number_tested = lambda issues_qs : 1.0*sum([ (ii or 1) for ii in  [i[0] for i in issues_qs.filter(status__icontains='tested').values_list('story_points')]])
        number_total = lambda issues_qs : 1.0*sum([ (ii or 1) for ii in  [i[0] for i in issues_qs.values_list('story_points')]])

        def get_css_class_for_level(level, reverse_colours=False):
            if level < settings.TRAFFIC_LEVEL_YELLOW:
                return 'traffic_green'  if not reverse_colours else "traffic_red"
            elif level < settings.TRAFFIC_LEVEL_RED:
                return "traffic_yellow"
            else:
                return "traffic_red" if not reverse_colours else "traffic_green"

        for entry in entries:
            ctc += entry.atrate
            billed += entry.atbillablerate

        stats['percentage_spent'] = 100 * float(billed)/float(self.budget) if self.budget > 0 else 100.0
        if stats['percentage_spent']>100:
            stats['percentage_spent']=100
        stats['budget_traffic_class'] = get_css_class_for_level(stats['percentage_spent'])
        stats['amount_under_budget'] = self.budget - billed
        stats['amount_over_budget'] = billed-self.budget
        stats['invoiced'] = self.has_invoices
        stats['paid'] = self.has_invoices and self.all_invoices_paid
        stats['total_issue_points'] = number_total(issues)
        stats['percent_tested'] = 100* (number_tested(issues)/stats['total_issue_points'] if stats['total_issue_points'] > 0 else 1)
        stats['percent_dev_done'] = stats['percent_tested'] + 100 * (number_dev_done(issues)/stats['total_issue_points'] if stats['total_issue_points'] > 0 else 0)
        stats['percent_dev_done_traffic_class'] = get_css_class_for_level(stats['percent_dev_done'], reverse_colours=True)
        stats['percent_tested_traffic_class'] = get_css_class_for_level(stats['percent_tested'], reverse_colours=True)
        stats['ctc'] = ctc
        stats['billed'] = billed
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
            if not bp.can_view_project_card:
                continue

            if user_id not in user_totals:
                user_total = {'user':user_id, 'hours':0, 'end_time':datetime.datetime.today()}
            else:
                user_total = user_totals[user_id]

            user = User.objects.get(pk=user_id)
            try:
                rate = Rate.objects.get(project=self, user=user)
            except Rate.DoesNotExist:
                rate = Rate.objects.create(project=self, user=user, amount=0)

            billed = float(user_total['hours']) * float(rate.billable_amount)

            users_and_hours['users'][user.username] = {
                'hours':user_total['hours'], 
                'rate':rate, 
                'revenue': float(user_total['hours'])*float(rate.amount), 
                'end_time': user_total['end_time'],
                'billed': billed
                }
            user_info = users_and_hours['users'][user.username]
            user_info['profit'] = user_info['billed'] - user_info['revenue']
            user_info['work_ratio'] = rate.work_ratio
            user_info['velocity'] = rate.velocity
            
            total_hours += user_total['hours']
            total_revenue += float(user_total['hours'])*float(rate.amount)
            total_billed += float(rate.billable_amount) * float(user_total['hours'])
            ctc_rate += float(rate.amount)
            billed_rate += float(rate.billable_amount)
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
        total_hours = users_and_hours['totals']['hours']

        for user, points in self.get_points_total().items():
            if user.username not in users_and_hours['users']:
                continue
            user_info = users_and_hours['users'][user.username]
            if int(user_info['hours']) == 0 and points == 0:
                continue

            try:
                rate = user_info['rate']
            except KeyError:
                continue
            velocity = rate.velocity or 1
            ratio = rate.work_ratio or 1
            user_hours = user_info['hours']
            
            total_adjustedd_billed = points * (1/ratio) * float(rate.billable_amount) * velocity
            total_adjustedd_ctc = points * (1/ratio) * float(rate.amount) * velocity

            ret[user] = {
                'points': points, 
                'hours':user_hours,
                'ctc':rate.amount*user_hours,
                'billable':rate.billable_amount*user_hours,
                'total_adjusted_billed': total_adjustedd_billed,
                'total_adjusted_ctc': total_adjustedd_ctc,
                'total_adjusted_profit': total_adjustedd_billed - total_adjustedd_ctc,
                'rate': rate,
                'velocity': (points/float(user_hours)) if float(user_hours)>0 else 1,
                'work_ratio': (user_hours/total_hours) if total_hours>0 else 1
            }
        return ret

    @property
    def stats(self):
        if self._stats is not None:
            return self._stats
        self.cache_stats()
        return self._stats

    @property
    def slack_percentage(self):
        return self.quote_uncertainty or 0.25

    @property
    def _last_entry_end_time(self):
        entries = Entry.objects.filter(project=self).order_by("-end_time")
        if entries.count()>0:
            return entries[0].end_time
        else:
            return None

    @property
    def _first_entry_start_time(self):
        entries = Entry.objects.filter(project=self).order_by("start_time")
        if entries.count()>0:
            return entries[0].start_time
        else:
            return None

    @property
    def total_hours(self):
        return self.total_hours_for_user(user=None)

    def can_view_by_user(self, user):
        return user.is_superuser or (user in self.users.all())

    def total_hours_for_user(self, user=None):
        entries_qs = Entry.objects.filter(project=self)

        if user is not None:
            entries_qs = entries_qs.filter(user=user)

        total = entries_qs.aggregate(hours=Sum('hours'))['hours']
        return total

    def total_unassigned_hours_for_user(self, user):
        entries_qs = Entry.objects.filter(project=self, user=user).filter(issue__isnull=True)
        total = entries_qs.aggregate(hours=Sum('hours'))['hours']
        return total

    def total_points_for_user(self, user, issue_status=None):
        entries_qs = IssuePoints.objects.filter(issue__project=self, user=user)
        if issue_status is not None:
            entries_qs = entries_qs.filter(issue__status=issue_status)
            
        total = entries_qs.aggregate(points=Sum('points'))['points']
        return total

    def total_points_for_user_for_issues_with_entries(self, user):
        """ returns the sum of all estimates for the given user, for
        issues where the given user has done at least some work """
        issues_with_entries = Issue.objects.filter(id__in=Entry.objects.filter(issue__project=self).filter(user=user).filter(issue__isnull=False).values('issue'))
        total_points = IssuePoints.objects.filter(issue__in=issues_with_entries).filter(user=user).aggregate(points=Sum('points'))
        return total_points['points']

    def get_users_with_time_but_no_estimates_in_this_project(self):
        users = [ User.objects.get(pk=user['user']) for user in Entry.objects.all().filter(project=self).filter(hours__gt=0).exclude(issue__isnull=False).order_by('user').values('user').annotate(Count('user'))]
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

    #         billed = float(user_total['hours']) * float(rate.billable_amount)

    #         res['users'][user.username] = {
    #             'hours':user_total['hours'], 
    #             'rate':rate, 
    #             'revenue': float(user_total['hours'])*float(rate.amount), 
    #             'end_time': user_total['end_time'],
    #             'billed': billed
    #             }
    #         user_info = res['users'][user.username]
    #         user_info['profit'] = user_info['billed'] - user_info['revenue']
    #         user_info['work_ratio'] = rate.work_ratio
    #         user_info['velocity'] = rate.velocity
            
    #         total_hours += user_total['hours']
    #         total_revenue += float(user_total['hours'])*float(rate.amount)
    #         total_billed += float(rate.billable_amount) * float(user_total['hours'])
    #         ctc_rate += float(rate.amount)
    #         billed_rate += float(rate.billable_amount)
    #     res['totals']['hours'] = total_hours
    #     res['totals']['revenue'] = total_revenue
    #     res['totals']['billed'] = total_billed
    #     res['totals']['ctc_rate'] = ctc_rate / len(user_totals) if len(user_totals)>0 else 0
    #     res['totals']['billed_rate'] = billed_rate / len(user_totals) if len(user_totals)>0 else 0
    #     res['totals']['profit'] = total_billed - total_revenue

    #     self._users_and_hours = res
    #     return res

    class Meta:
        ordering = ('name', 'status', 'type',)
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
        all_project_issues = Issue.objects.filter(project=self)
        
        orderless_issues = all_project_issues.filter(order__isnull=True).order_by('-id')
        ordered_issues = all_project_issues.exclude(order__isnull=True).order_by('order')
        
        if len(orderless_issues) > 0:
            all_issues = [ issue for issue in orderless_issues ] + [ issue for issue in ordered_issues ]
            for index,issue in enumerate(all_issues):
                if issue.order != index:
                    issue.order = index            
                    issue.save()
        return Issue.objects.filter(project=self).order_by("order")
            
class RelationshipType(models.Model):
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


class ProjectRelationship(models.Model):
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


class Activity(models.Model):
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


class HourGroup(models.Model):
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


class ActivityGroup(models.Model):
    """Activities that are allowed for a project"""

    name = models.CharField(max_length=255, unique=True)
    activities = models.ManyToManyField(
        Activity,
        related_name='activity_group',
    )

    def __unicode__(self):
        return self.name


class Location(models.Model):
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
        if user.is_superuser:
            return self
        return self.filter(project__users=user)

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
                rate = Rate.objects.filter(user_id=hours_per_user['user'], project_id=project.id).values('amount', 'billable_amount')[0]
            except IndexError:
                rate = {'billable_amount':0, 'amount':0}

            hours += hours_per_user['user_hours']
            ctc += hours_per_user['user_hours'] * rate['amount']
            billable += hours_per_user['user_hours'] * rate['billable_amount']

        return { 'hours': hours,
                 'ctc': ctc,
                 'billable': billable }

    def get_aggregated_info(self):
        return self.order_by('comments').values('comments').annotate(x=Count('comments'), hours=Sum('hours'))

class EntryQuerySet(EntriesQuerySet):
    """QuerySet extension to provide filtering by billable status"""

    def date_trunc(self, key='month', extra_values=None):
        select = {"day": {"date": """DATE_TRUNC('day', end_time)"""},
                  "week": {"date": """DATE_TRUNC('week', end_time)"""},
                  "month": {"date": """DATE_TRUNC('month', end_time)"""},
        }
        basic_values = (
            'user', 'date', 'user__first_name', 'user__last_name', 'billable',
        )
        extra_values = extra_values or ()
        qs = self.extra(select=select[key])
        qs = qs.values(*basic_values + extra_values)
        qs = qs.annotate(hours=Sum('hours')).order_by('user__last_name',
                                                      'date')
        return qs

    def timespan(self, from_date, to_date=None, span=None):
        """
        Takes a beginning date a filters entries. An optional to_date can be
        specified, or a span, which is one of ('month', 'week', 'day').
        N.B. - If given a to_date, it does not include that date, only before.
        """
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

class EntryManagerBase(QuerySetManager):
    def __init__(self):
        super(EntryManagerBase, self).__init__(EntryQuerySet)

    def date_trunc(self, key='month', extra_values=()):
        return self.get_query_set().date_trunc(key, extra_values)

    def timespan(self, from_date, to_date=None, span='month'):
        return self.get_query_set().timespan(from_date, to_date, span)

class EntryManager(EntryManagerBase):

    def get_query_set(self):
        qs = EntryQuerySet(self.model)
        qs = qs.select_related('activity', 'project__type')

        # ensure our select_related are added.  Without this line later calls
        # to select_related will void ours (not sure why - probably a bug
        # in Django)
        # in other words: do not remove!
        str(qs.query)

        qs = qs.extra({'billable': 'timepiece_activity.billable AND '
                                   'timepiece_attribute.billable'})
        return qs


class EntryWorkedManager(EntryManager):

    def get_query_set(self):
        qs = EntryQuerySet(self.model)
        projects = getattr(settings, 'TIMEPIECE_PROJECTS', {})
        return qs.exclude(project__in=projects.values())


class Entry(models.Model):
    """
    This class is where all of the time logs are taken care of
    """

    user = models.ForeignKey(User, related_name='timepiece_entries')
    project = models.ForeignKey(Project, related_name='entries')
    activity = models.ForeignKey(
        Activity,
        related_name='entries',
    )
    location = models.ForeignKey(
        Location,
        related_name='entries',
    )
    entry_group = models.ForeignKey(
       'EntryGroup',
        related_name='entries',
        blank=True, null=True,
        on_delete=models.SET_NULL,
    )
    status = models.CharField(
        max_length=24,
        choices=ENTRY_STATUS,
        default='unverified',
    )

    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True, db_index=True)
    seconds_paused = models.PositiveIntegerField(default=0)
    pause_time = models.DateTimeField(blank=True, null=True)
    comments = models.TextField(blank=True)
    extended_comments = models.TextField(blank=True)
    date_updated = models.DateTimeField(auto_now=True)

    hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    objects = EntryManager()
    worked = EntryWorkedManager()
    no_join = EntryManagerBase()
    issue = models.ForeignKey('Issue', blank=True, null=True, related_name='entries')

    @property
    def atrate(self):
        return self.hours * self.rate

    @property
    def atbillablerate(self):
        return self.hours * self.billable_rate

    @property
    def billable_rate(self):
        try:
            return self._billable_rate
        except AttributeError:
            try:
                self._billable_rate = Rate.objects.get(project=self.project, user=self.user).billable_amount
            except Rate.DoesNotExist:
                self._billable_rate = 0
            return self._billable_rate

    @property
    def rate(self):
        try:
            return self._rate
        except AttributeError:
            try:
                self._rate = Rate.objects.get(project=self.project, user=self.user).amount
            except Rate.DoesNotExist:
                self._rate = 0
            return self._rate

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
                'project': entry.project,
                'activity': entry.activity,
                'start_time': entry.start_time,
                'end_time': entry.end_time
            }
            #Conflicting saved entries
            if entry.end_time:
                if entry.start_time.date() == start.date() \
                and entry.end_time.date() == end.date():
                    entry_data['start_time'] = entry.start_time.strftime(
                        '%H:%M:%S')
                    entry_data['end_time'] = entry.end_time.strftime(
                        '%H:%M:%S')
                    output = 'Start time overlaps with: ' + \
                    '%(project)s - %(activity)s - ' % entry_data + \
                    'from %(start_time)s to %(end_time)s' % entry_data
                    raise ValidationError(output)
                else:
                    entry_data['start_time'] = entry.start_time.strftime(
                        '%H:%M:%S on %m\%d\%Y')
                    entry_data['end_time'] = entry.end_time.strftime(
                        '%H:%M:%S on %m\%d\%Y')
                    output = 'Start time overlaps with: ' + \
                    '%(project)s - %(activity)s - ' % entry_data + \
                    'from %(start_time)s to %(end_time)s' % entry_data
                    raise ValidationError(output)
        try:
            act_group = self.project.activity_group
            if act_group:
                activity = self.activity
                if not act_group.activities.filter(pk=activity.pk).exists():
                    name = activity.name
                    err_msg = '%s is not allowed for this project. ' % name
                    allowed = act_group.activities.filter()
                    allowed = allowed.values_list('name', flat=True)
                    allowed_names = ['among ']
                    if len(allowed) > 1:
                        for index, activity in enumerate(allowed):
                            allowed_names += activity
                            if index < len(allowed) - 2:
                                allowed_names += ', '
                            elif index < len(allowed) - 1:
                                allowed_names += ', and '
                        allowed_activities = ''.join(allowed_names)
                    else:
                        allowed_activities = allowed[0]
                    err_msg += 'Please choose %s' % allowed_activities
                    raise ValidationError(err_msg)
        except (Project.DoesNotExist, Activity.DoesNotExist):
            # Will be caught by field requirements
            pass
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
        if entries.exists():
            msg = 'You cannot add entries after a timesheet has been ' \
                'approved or invoiced. Please correct the start and end times.'
            raise ValidationError(msg)
        return True

    def save(self, *args, **kwargs):
        self.hours = Decimal('%.2f' % round(self.total_hours, 2))
        super(Entry, self).save(*args, **kwargs)

    def get_seconds(self):
        """
        Determines the difference between the starting and ending time.  The
        result is returned as an integer of seconds.
        """
        if self.start_time and self.end_time:
            # only calculate when the start and end are defined
            delta = self.end_time - self.start_time
            seconds = delta.seconds - self.seconds_paused
        else:
            seconds = 0
            delta = datetime.timedelta(days=0)

        return seconds + (delta.days * 86400)

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
        invoiced = entries.filter(status='invoiced').filter(project__billable=True).aggregate(total=Sum('hours'))['total']
        unbillable = entries.filter(status='invoiced').exclude(project__billable=True).aggregate(total=Sum('hours'))['total']
        
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
            qs = entries.filter(project=projects[name])
            data['paid_leave'][name] = qs.aggregate(s=Sum('hours'))['s']
        return data

    def __unicode__(self):
        """
        The string representation of an instance of this class
        """
        return '%s on %s' % (self.user, self.project)

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
        issue_id = None

        for regex in [ "[iI]ssue *#(\d+)", "[iI]ssue(\d+)", "[iI]ssue (\d+)" ]:
            match_object = re.compile(regex).search(self.comments)
            if match_object and match_object.groups() != 0:
                try:
                    issue_id = int(match_object.group(1))
                    return issue_id
                except Exception:
                    pass
        return issue_id

class EntryGroup(models.Model):
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


class ProjectContract(models.Model):
    CONTRACT_STATUS = (
        ('upcoming', 'Upcoming'),
        ('current', 'Current'),
        ('complete', 'Complete'),
    )

    project = models.ForeignKey(Project, related_name='contracts')
    start_date = models.DateField()
    end_date = models.DateField()
    num_hours = models.DecimalField(max_digits=8, decimal_places=2,
                                    default=0)
    status = models.CharField(choices=CONTRACT_STATUS, default='upcomming',
                              max_length=32)

    def hours_worked(self):
        # TODO put this in a .extra w/a subselect
        if not hasattr(self, '_hours_worked'):
            self._hours_worked = Entry.objects.filter(
                project=self.project,
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


class ContractMilestone(models.Model):
    contract = models.ForeignKey(ProjectContract, related_name='milestones')
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    hours = models.DecimalField(max_digits=8, decimal_places=2,
                                default=0)

    class Meta(object):
        ordering = ('end_date',)

    def hours_worked(self):
        """Hours worked during this milestone"""
        if not hasattr(self, '_hours_worked'):
            self._hours_worked = Entry.objects.filter(
                project=self.contract.project,
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
                project=self.contract.project,
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


# contract assignment logger
logger = logging.getLogger('timepiece.ca')


class ContractAssignment(models.Model):
    contract = models.ForeignKey(ProjectContract, related_name='assignments')
    user = models.ForeignKey(
        User,
        related_name='assignments',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    num_hours = models.DecimalField(max_digits=8, decimal_places=2,
                                    default=0)
    min_hours_per_week = models.IntegerField(default=0)

    objects = AssignmentManager()

    def _log(self, msg):
        logger.debug('{0} - {1}'.format(self, msg))

    def _filtered_hours_worked(self, end_date):
        return Entry.objects.filter(
            user=self.user,
            project=self.contract.project,
            start_time__gte=self.start_date,
            end_time__lt=end_date,
        ).aggregate(sum=Sum('hours'))['sum'] or 0

    def filtered_hours_worked_with_in_window(self, start_date, end_date):
        return Entry.objects.filter(
            user=self.user,
            project=self.contract.project,
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


class AssignmentAllocation(models.Model):
    assignment = models.ForeignKey(ContractAssignment, related_name='blocks')
    date = models.DateField()
    hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)

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


class PersonSchedule(models.Model):
    user = models.ForeignKey(
        User,
        unique=True,
        null=True,
    )
    hours_per_week = models.DecimalField(max_digits=8, decimal_places=2,
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


class UserProfile(models.Model):
    user = models.OneToOneField(User, unique=True, related_name='profile')
    amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    billable_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    project_names_to_ignore = models.TextField(blank=True)
    jira_user_name = models.CharField(max_length=100, blank=True, null=True, help_text="Username used when synching with jira")
    authenticate_token = models.CharField(max_length=100, blank=True, null=True, help_text="Authentication token remote connections")

    def __unicode__(self):
        return unicode(self.user)

    def save(self, *args, **kwargs):
        if self.authenticate_token is None:
            self.authenticate_token = str(uuid.uuid4()).replace("-","")
        super(UserProfile, self).save(*args, **kwargs)

class ProjectHours(models.Model):
    week_start = models.DateField(verbose_name='start of week')
    project = models.ForeignKey(Project)
    user = models.ForeignKey(User)
    hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)
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

class Salary(models.Model):
    user = models.ForeignKey(User)
    amount = models.DecimalField(max_digits=8,decimal_places=2,default=0)
    date = models.DateField(verbose_name='month')
    paye = models.DecimalField(max_digits=8,decimal_places=2,default=0)
    uif = models.DecimalField(max_digits=8,decimal_places=2,default=0)
    bonus = models.DecimalField(max_digits=8,decimal_places=2,default=0)
    expenses = models.DecimalField(max_digits=8,decimal_places=2,default=0)
    leave_accrued = models.DecimalField(max_digits=8,default=0,decimal_places=2, verbose_name="Leave accrued this month")
    leave_taken = models.DecimalField(max_digits=8,default=0,decimal_places=2, verbose_name="Leave taken this month")
    sick_days = models.DecimalField(max_digits=8,default=0,decimal_places=2, verbose_name="Sick days taken this month")

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

class Rate(models.Model):
    project = models.ForeignKey(Project, related_name="rate")
    user = models.ForeignKey(User)
    amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    billable_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    work_ratio = models.FloatField(default=0)
    velocity = models.FloatField(default=1)

class Expense(models.Model):
    date = models.DateField()
    amount = models.DecimalField(max_digits=8,decimal_places=0,default=0)
    description = models.CharField(max_length=255, blank=True, null=True)
    project = models.ForeignKey(Project, related_name='expense', null=True, blank=True)
    paid = models.BooleanField()
    class Meta:
        permissions = (
            ('view_expense', 'Can view expenses.'),
        )

class Income(models.Model):
    date = models.DateField()
    amount = models.DecimalField(max_digits=8,decimal_places=0,default=0)

class Invoice(models.Model):
    description = models.CharField(max_length=255, blank=True, null=True)
    date_sent = models.DateField(blank=True,null=True)
    date_paid = models.DateField(blank=True,null=True)
    amount = models.DecimalField(max_digits=8,decimal_places=0,default=0)
    project = models.ForeignKey(Project, related_name='invoices', null=True, blank=True)
    invoice_number = models.DecimalField(max_digits=8, decimal_places=0,default=0)
    paid = models.BooleanField()

    class Meta:
        permissions = (
            ('view_invoice', 'Can view invoices.'),
        )

class IssueRepresentation(object):
    """ object used to map helper data when rendering issues that doesn't belong in the database """

    @property
    def options(self):
        return str([ list(pair) for pair in Issue.ISSUE_STATUS_CHOICES ]) 

class Issue(models.Model):
    ISSUE_STATUS_CHOICES = (
           ( 'bug', 'bug'),
           ( 'devdone', 'dev_done'),
           ( 'dev unclear', 'dev unclear'),
           ( 'duplicate', 'duplicate'),
           ( 'in testing', 'in testing'),
           ( 'new', 'new'),
           ( 'onhold', 'on hold'),
           ( 'reopened', 'reopened'),
           ( 'tested', 'tested'),
           ( 'task done', 'task done'),
           ( 'tested', 'tested'),
           ( 'to be designed', 'to be designed'),
        )
    
    status = models.CharField(max_length=255, choices = ISSUE_STATUS_CHOICES, blank=False)
    number = models.IntegerField(null=True,blank=True, db_index=True)
    project = models.ForeignKey(Project, related_name='issues')
    subject = models.TextField(db_index=True)
    description = models.TextField(blank=True)
    story_points = models.FloatField(null=True,blank=True)    
    order = models.IntegerField(null=True,blank=True)
    feature = models.ForeignKey("Feature",blank=True,null=True,related_name='issues')
    assigned_to = models.ForeignKey(User, related_name='assigned_issues', blank=True,null=True)
    interface_plugin_number = models.CharField(max_length=255, null=True, blank=True) #eg jira
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    @classmethod
    def get_last_issue_number(self, business):
        largest_number =  Issue.objects.filter(project__business=business).filter(number__isnull=False).aggregate(largest_number=Max("number"))['largest_number']
         
        return largest_number or 0

    @classmethod
    def get_next_issue_number(self, business):
        return Issue.get_last_issue_number(business) +1 

    def __init__(self, *args, **kwargs):
        super(Issue, self).__init__(*args, **kwargs)
        self._entries = None
        self.representation = IssueRepresentation()
        self.representation.per_user = SortedDict()

    def status_as_class(self):
        return 'status_%s' % self.status.replace(" ","_").lower()

    def get_points(self):
        business_users = self.project.business.users
        for user in business_users:
            try:
                IssuePoints.objects.get(user=user, issue=self)
            except IssuePoints.DoesNotExist:
                IssuePoints.objects.create(user=user,issue=self)

        return self.user_points.filter(user__id__in=[i.id for i in business_users]).order_by("user")

    def set_order(self):
        if self.order is not None:
            return self
        project_issue_order = Issue.objects.filter(project = self.project).aggregate(max_order=Max('order'))
        current_order = project_issue_order['max_order'] or 0
        new_order = current_order + 1
        self.order = new_order
        self.save()
        return self

    def get_user_issue_points(self, user):

        if isinstance(user,basestring):
            user = User.objects.get(username=user)        

        try:
            return IssuePoints.objects.get(user=user, issue=self)
        except IssuePoints.DoesNotExist:
            business_users = [u.id for u in self.project.business.users]
            if user.id in business_users:
                return IssuePoints.objects.create(user=user,issue=self)
            return None
        except IssuePoints.MultipleObjectsReturned:
            return IssuePoints.objects.filter(user=user,issue=self).order_by("user__id")[0]

    def set_points(self, user, points):
        try:
            issue_points = IssuePoints.objects.get(user=user, issue=self)
        except IssuePoints.DoesNotExist:
            issue_points = IssuePoints.objects.create(user=user, issue=self)

        issue_points.points = points 
        issue_points.save()

    @property
    def issue_number_duplicates_in_business(self):
        return Issue.objects.filter(project__business=self.project.business).filter(number=self.number).exclude(pk=self.id)
        if duplicates.count()>0:
            return duplicates
        return []

    @property
    def css_class(self):
        status = self.status.replace(" ","").replace("_","").lower()
        if status == 'devdone':
            return "devdone"
        elif status == 'tested':
            return "tested"
        else:
            return "open"

    def is_closed(self):
        return self.status.replace(" ","").lower() == 'tested'

    def add_user_to_representation(self, user, per_user_issue_data):
        self.representation.per_user[user] = per_user_issue_data

    @property
    def related_entries(self):
        return self.entries.all()
        # if self._entries is not None:
        #     return self._entries
        # entries = []
        # for entry in self.project.entries.all():
        #     if entry.try_get_issue_id()==self.number:
        #         entries.append(entry)
        # self._entries = entries
        # return entries

    @property
    def hours(self):
        return self.related_entries.all().aggregate(total_hours=Sum('hours'))['total_hours']

    def hours_for_user(self, user):
        return self.related_entries.all().filter(user=user).aggregate(total_hours=Sum('hours'))['total_hours'] or 0

    def hours_for_users(self):
        return [ (User.objects.get(pk=x['user']), x['hours']) for x in self.related_entries.all().filter(hours__gt=0).values("user").order_by("user").annotate(hours=Sum('hours')) ]

    @property
    def ctc(self):
        cost = 0
        for entry in self.related_entries:
            cost += entry.atrate
        return cost

    @property
    def billable(self):
        cost = 0
        for entry in self.related_entries:
            cost += entry.atbillablerate
        return cost

    @classmethod
    def get_unassigned_timesheet_entries(self, project):
        return project.entries.filter(issue__isnull=True).order_by("start_time")

    def comments_in_order(self):
        return self.comments.get_query_set().order_by("created")

class IssueStatus(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    business = models.ForeignKey(Business,related_name='stati')

    class Meta:
        unique_together = (('name', 'business'), )

    def __unicode__(self):
        return self.name

class IssueComment(models.Model):
    issue = models.ForeignKey(Issue, blank=False, null=False, related_name='comments')
    comment = models.TextField(blank=True)
    author = models.ForeignKey(User, related_name='issue_comments', blank=False, null=False)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    
class IssueAttachment(models.Model):
    issue = models.ForeignKey(Issue, blank=False, null=False, related_name='attachments')
    attachment = models.FileField(upload_to="issue_attachments", null=False, blank=False)
    name = models.CharField(max_length=255)

class RedmineToTimepieceBusinessMapping(models.Model):
    redmine_business_name = models.CharField(max_length=255)
    timepiece_business_name = models.CharField(max_length=255)

    @classmethod
    def find_from_redmine(self, redmine_business_name):
        try:
            return RedmineToTimepieceBusinessMapping.objects.get(redmine_business_name=redmine_business_name).timepiece_business_name
        except RedmineToTimepieceBusinessMapping.DoesNotExist:
            return redmine_business_name

class RedmineToTimepieceProjectMapping(models.Model):
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

class IssuePoints(models.Model):

    class Meta:
        unique_together = (('user','issue'),)

    user = models.ForeignKey(User,related_name="user_points")
    points = models.FloatField(null=True,blank=True)
    issue = models.ForeignKey(Issue, related_name="issue_points")

    def __unicode__(self):
        return u'%s:%s - %s points' % (self.issue.subject, self.user.username, self.points)

class IssueHistory(models.Model):
    
    issue_id = models.IntegerField(blank=False, null=False, db_index=True)
    created_by = models.ForeignKey(User, blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=False, null=False)
    before = models.TextField(blank=True, null=True)
    after = models.TextField(blank=True, null=True)

    @classmethod
    def add_history(self, user, issue, description, before, after):
        IssueHistory.objects.create(created_by=user, issue_id=issue.id, description=description,
                                    before=before, after=after)
        
    @classmethod
    def for_issue(self, issue):
        return IssueHistory.objects.filter(issue_id=issue.id).order_by("-created_at")

class BusinessDocument(models.Model):
    
    business = models.ForeignKey(Business, null=False, blank=False, related_name='documents', db_index=True)
    filename = models.CharField(max_length=255, null=False, blank=False)
    doc = models.FileField(upload_to="project_documents", null=False, blank=False)
    doc_type = models.CharField(max_length=100, null=False, blank=False, 
                                choices = ( ('invoice', 'Invoice'), ('summary', 'Sprint summary'),
                                            ('proposal', 'Sprint proposal'), ('contract', 'Contract'),
                                            ('other', 'Other') ) )
    mime_type = models.CharField(max_length=50, null=False, blank=False)
    token = models.CharField(max_length=255, null=False, blank=False, db_index=True)
    comments = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(User, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted = models.BooleanField(default=False, blank=True)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = str(uuid.uuid4()).replace("-","")
        super(BusinessDocument, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.filename
