#-*- coding: utf-8 -*-
from django.conf import settings
from django.db.models.query import QuerySet
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q, F, Max, Min
from django.db import models
from lib.quality_helper import Quality
from timepiece.models import Issue
from timepiece.models import Business as Project
from lib.fields import ProtectedForeignKey
import re

class Testable(models.Model):
    include_in_regression_test = models.BooleanField(default=True, blank=True)
    issue = models.ForeignKey(Issue, blank=True, null=True, related_name='testables')
    project = ProtectedForeignKey(Project, blank=True, null=False, related_name='testables')
    features = models.ManyToManyField("imptime.Feature", related_name="testables")
    name = models.TextField(null=True)
    steps = models.TextField(null=True) # deprecated as of 24Jan2019
    enriched_steps = models.TextField(null=True) #deprecated as of 24Jan2019
    order = models.IntegerField(null=False, default=0)
    quality_error = models.CharField(max_length=255, null=True)
    implementing_issues = models.ManyToManyField(Issue, related_name="implements_testables")

    def __init__(self, *args, **kwargs):
        super(Testable, self).__init__(*args, **kwargs)
        self._step_groups = None

    def save(self, *args, **kwargs):
        super(Testable, self).save(*args, **kwargs)
        self.quality_error = self.check_quality()
        if self.issue_id:
            self.issue.save()
        for feature in self.features.all():
            feature.save()

    def copy(self):
        clone = Testable.objects.create(include_in_regression_test=self.include_in_regression_test,
                                        issue=self.issue,
                                        steps=self.steps,
                                        enriched_steps=self.enriched_steps,
                                        project=self.project,
                                        name=self.name,
                                        order=self.order,
                                        quality_error=self.quality_error)

        for line in self.testable_lines.all():
            line_clone = line.copy()
            line_clone.testable = clone
            line_clone.save()
            clone.testable_lines.add(line_clone)
        
        return clone
        
    def check_quality(self):
        quality_error = Quality().check_sequence_of_short_steps(self.steps)
        if quality_error != self.quality_error:
            self.quality_error = quality_error
            super(Testable, self).save()

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

    @property
    def most_recent_result(self):
        return self.testable_results.order_by("-checked_at").first()

    @classmethod
    def renumber_for_issue(self, issue_id):
        c = 1
        for t in Testable.objects.filter(issue_id=issue_id).order_by("order"):
            if t.order != c:
                t.order = c
                t.save()
            c += 1

    @classmethod
    def renumber_for_feature(self, feature_id):
        c = 1
        for t in Testable.objects.filter(features=feature_id).order_by("order"):
            if t.order != c:
                t.order = c
                t.save()
            c += 1

            
class TestableLine(models.Model):
    instruction = models.TextField(null=True)
    testable = models.ForeignKey(Testable, blank=False, null=False, related_name='testable_lines', on_delete=models.CASCADE)
    refers_to_testable = ProtectedForeignKey(Testable, blank=False, null=True, related_name='referred_by_testable_lines') # links this line to another line, in which case instruction can be null
    order = models.IntegerField(null=False, default=0)

    @classmethod
    def renumber_for_testable(self, testable_id):
        c = 1
        for t in TestableLine.objects.filter(testable=testable_id).order_by("order"):
            if t.order != c:
                t.order = c
                t.save()
            c += 1

    def copy(self):
        return TestableLine.objects.create(instruction=self.instruction,
                                           testable=self.testable,
                                           refers_to_testable=self.refers_to_testable,
                                           order=self.order)
    
class TestableSession(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(null=False, auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='testable_sessions', blank=False, null=False)
    modified_at = models.DateTimeField(null=False, auto_now=True)
    business = models.ForeignKey(Project, blank=True, null=False, related_name='test_sessions')

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
