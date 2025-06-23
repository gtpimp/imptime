import datetime
import logging
from decimal import Decimal
from django.db.models import Count
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError, NON_FIELD_ERRORS
from django.db import models
from django.db.models import Q, Avg, Sum, Max, Min
from timepiece import utils
from dateutil.relativedelta import relativedelta
from dateutil import rrule
from datetime import timedelta

def redmine_mapping(username, business):
    for mapping in settings.REDMINE_DB_MAPPING:
        if mapping['username'] == username and mapping['business'] == business:
            if 'mapped_username' not in mapping:
                mapping['mapped_username'] = username
            return mapping
    raise Exception("No redmine mapping found for username=%s and business=%s" % (username, business))

def redmine_username(username, business):
    mapping = redmine_mapping(username, business)
    if 'mapped_user' in mapping:
        return mapping['mapped_user']
    else:
        return username

def redmine_db(username, business):
    return redmine_mapping(username, business)['db']

def redmine_mappings_for_username(username):
    mappings = []
    for x in settings.REDMINE_DB_MAPPING:
        if x['username'] == username:
            if 'mapped_username' not in x:
                x['mapped_username'] = username
            mappings.append(x)
    return mappings

class RedmineEnumeration(models.Model):
    class Meta:
        db_table = 'enumerations'
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    
    @classmethod
    def get_default_for_time_entry(self, db):
        return RedmineEnumeration.objects.using(db).filter(type='TimeEntryActivity')[0]

class RedmineUser(models.Model):
    class Meta:
        db_table = 'users'

    login = models.CharField(max_length=255)
        
    @classmethod
    def get_for_mapped_username(self, db, mapped_username):
        return RedmineUser.objects.using(db).get(login=mapped_username)

class RedmineProject(models.Model):
    class Meta:
        db_table = "projects"

    name = models.CharField(max_length=255)

class RedmineTracker(models.Model):
    class Meta:
        db_table = 'trackers'
    name = models.CharField(max_length=255)

class RedmineIssueStatus(models.Model):
    class Meta:
        db_table = 'issue_statuses'
    name = models.CharField(max_length=255)

class RedmineVersion(models.Model):
    class Meta:
        db_table = 'versions'
    name = models.CharField(max_length=255)
    project = models.ForeignKey(RedmineProject, on_delete=models.CASCADE)

class RedmineIssue(models.Model):
    class Meta:
        db_table = 'issues'

    project = models.ForeignKey(RedmineProject, on_delete=models.CASCADE)
    description = models.TextField()
    subject = models.TextField()
    tracker = models.ForeignKey(RedmineTracker, on_delete=models.CASCADE)
    story_points = models.FloatField()
    estimated_hours = models.FloatField()
    done_ratio = models.IntegerField()
    status = models.ForeignKey(RedmineIssueStatus, on_delete=models.CASCADE)
    fixed_version = models.ForeignKey(RedmineVersion,null=True,blank=True, on_delete=models.SET_NULL)

    def get_custom_value(self, value_name):
        try:
            custom_field = RedmineCustomField.objects.using(self.redmine_db).get(name=value_name)
        except RedmineCustomField.DoesNotExist:
            return None
        try:
            value = RedmineCustomValue.objects.using(self.redmine_db).get(customized_id=self.id, customized_type='Issue', custom_field=custom_field)
        except RedmineCustomValue.DoesNotExist:
            return None
        return value.value

    @classmethod
    def get_for_issue_id(self, db, issue_id):
        issue = RedmineIssue.objects.using(db).get(pk=int(issue_id))
        issue.redmine_db = db
        return issue

class RedmineCustomField(models.Model):
    class Meta:
        db_table = 'custom_fields'
    name = models.CharField(max_length=255)
    
class RedmineCustomFieldsTracker(models.Model):
    class Meta:
        db_table = "custom_fields_trackers"
    custom_field = models.ForeignKey(RedmineCustomField, on_delete=models.CASCADE)
    tracker = models.ForeignKey(RedmineTracker, on_delete=models.CASCADE)

class RedmineCustomValue(models.Model):
    class Meta:
        db_table = "custom_values"
    custom_field = models.ForeignKey(RedmineCustomField, on_delete=models.CASCADE)
    value = models.TextField()
    customized_type = models.CharField(max_length=30)
    customized_id = models.IntegerField()

class RedmineTimeEntry(models.Model):
    class Meta:
        db_table = 'time_entries'
        
    user = models.ForeignKey(RedmineUser, on_delete=models.CASCADE)
    project = models.ForeignKey(RedmineProject, on_delete=models.CASCADE)
    issue = models.ForeignKey(RedmineIssue, on_delete=models.CASCADE)
    hours = models.FloatField()
    comments = models.CharField(max_length=255, blank=True, null=True)
    spent_on = models.DateField()
    activity = models.ForeignKey(RedmineEnumeration, on_delete=models.CASCADE)
    tyear = models.IntegerField()
    tmonth = models.IntegerField()
    tweek = models.IntegerField()
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    @classmethod
    def delete_for_user_and_daterange(self, username, start_time, end_time):

        for mapping in redmine_mappings_for_username(username):
            db = mapping['db']
            if db is not None:
                mapped_username = mapping['mapped_username']
                user = RedmineUser.get_for_mapped_username(db, mapped_username)
                RedmineTimeEntry.objects.using(db).filter(user=user).filter(spent_on__gte=start_time).filter(spent_on__lte=end_time).delete()

    @classmethod
    def create(self, business, issue_id, username, start_time, end_time, comment='auto_created'):
        mapping = redmine_mapping(username, business)
        db = mapping['db']
        mapped_username = mapping['mapped_username']
        user = RedmineUser.get_for_mapped_username(db, mapped_username)
        issue = RedmineIssue.get_for_issue_id(db, issue_id)
        hours = float((end_time-start_time).seconds) / (60*60)
        week_number = start_time.isocalendar()[1]
        time_entry = RedmineTimeEntry(user=user, issue=issue, hours=hours, comments=comment,
                                      project = issue.project,
                                      spent_on=start_time, activity=RedmineEnumeration.get_default_for_time_entry(db),
                                      tyear=start_time.year, tmonth=start_time.month, tweek=week_number)
        time_entry.save(using=db)
        return time_entry

class BambooInvoice(models.Model):
    dateIssued = models.DateField(blank=True,null=True)

    class Meta:
        db_table = 'bamboo_invoices'

    @property
    def total_ex_vat(self):
        total = 0.0
        for i in self.invoice_items.get_query_set():
            total += float(i.total_ex_vat)
        return total
    
class BambooInvoiceItems(models.Model):

    class Meta:
        db_table = 'bamboo_invoice_items'

    amount = models.FloatField(blank=True,null=True)
    quantity = models.FloatField(blank=True,null=True)
    invoice = models.ForeignKey(BambooInvoice, related_name='invoice_items', on_delete=models.CASCADE)
    
    @property
    def total_ex_vat(self):
        return self.amount * self.quantity
