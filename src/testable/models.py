#-*- coding: utf-8 -*-
from django.conf import settings
from django.db.models.query import QuerySet
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q, F, Max, Min
from django.db import models
from datetime import datetime, date
from timepiece.models import Issue
import re

class Testable(models.Model):
    include_in_regression_test = models.BooleanField(default=True, blank=True)
    issue = models.ForeignKey(Issue, blank=True, null=False, related_name='testables')
    steps = models.TextField(null=False)

    def __init__(self, *args, **kwargs):
        super(Testable, self).__init__(*args, **kwargs)
        self._step_groups = None

    @property
    def clean_steps(self):
        s = self.steps.strip()
        if s[0] == ':':
            s = s[1:]
        if s.startswith('s:'):
            s = s[2:]
        return s
    
    @classmethod
    def update_from_issue_description(self, issue, description):
        Testable.objects.filter(issue=issue).delete()
        groups = re.split("testable", description, flags=re.IGNORECASE)
        if len(groups) <= 1:
            return
        step_groups = groups[1:]
        for step_group in step_groups:
            Testable.objects.create(steps=step_group, issue=issue)
