#-*- coding: utf-8 -*-
from django.conf import settings
from django.db.models.query import QuerySet
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q, F, Max, Min
from django.db import models
from datetime import datetime, date
from timepiece.models import Issue, Business
import re

class Testable(models.Model):
    include_in_regression_test = models.BooleanField(default=True, blank=True)
    issue = models.ForeignKey(Issue, blank=True, null=False, related_name='testables')
    steps = models.TextField(null=False)
    order = models.IntegerField(null=False, default=0)

    def __init__(self, *args, **kwargs):
        super(Testable, self).__init__(*args, **kwargs)
        self._step_groups = None
 
    @property
    def clean_steps(self):
        s = self.steps.strip()
        if not s:
            return s
        if s[0] == ':':
            s = s[1:]
        if s.startswith('s:'):
            s = s[2:]
        return s
    
    @classmethod
    def update_from_issue_description(self, issue, description):
        testables_to_delete = Testable.objects.filter(issue=issue)
        for testable_to_delete in testables_to_delete:
            testable_to_delete.testable_results.update(testable=None)
            testable_to_delete.delete()
        
        groups = re.split("testable", description, flags=re.IGNORECASE)
        if len(groups) <= 1:
            return
        step_groups = groups[1:]
        for index, step_group in enumerate(step_groups):
            Testable.objects.create(steps=step_group, issue=issue, order=index)

    @property
    def most_recent_result(self):
        return self.testable_results.order_by("-checked_at").first()
            
class TestableSession(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(null=False, auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='testable_sessions', blank=False, null=False)
    modified_at = models.DateTimeField(null=False, auto_now=True)
    business = models.ForeignKey(Business, blank=True, null=False, related_name='test_sessions')

    def __unicode__(self):
        return self.name
    
class TestableResult(models.Model):
    TESTABLE_RESULT_CHOICES = [ ('untested', 'Untested'), ('failed', 'Failed'), ('passed', 'Passed') ]
    testable = models.ForeignKey(Testable, blank=True, null=True, related_name='testable_results')
    testable_session = models.ForeignKey(TestableSession, blank=True, null=False,
                                         related_name='testable_results')
    checked_by = models.ForeignKey(User, related_name='testable_results', blank=False, null=False)
    checked_at = models.DateTimeField(null=False)
    status = models.CharField(max_length=10, default='untested', choices=TESTABLE_RESULT_CHOICES)
