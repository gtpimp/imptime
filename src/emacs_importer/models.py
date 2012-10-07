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

class RedmineIssue(models.Model):
    class Meta:
        db_table = 'issues'

    project = models.ForeignKey(RedmineProject)

    @classmethod
    def get_for_issue_id(self, db, issue_id):
        return RedmineIssue.objects.using(db).get(pk=int(issue_id))

class RedmineTimeEntry(models.Model):
    class Meta:
        db_table = 'time_entries'
        
    user = models.ForeignKey(RedmineUser)
    project = models.ForeignKey(RedmineProject)
    issue = models.ForeignKey(RedmineIssue)
    hours = models.FloatField()
    comments = models.CharField(max_length=255, blank=True, null=True)
    spent_on = models.DateField()
    activity = models.ForeignKey(RedmineEnumeration)
    tyear = models.IntegerField()
    tmonth = models.IntegerField()
    tweek = models.IntegerField()
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    @classmethod
    def delete_for_user_and_daterange(self, username, start_time, end_time):

        for mapping in redmine_mappings_for_username(username):
            db = mapping['db']
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

