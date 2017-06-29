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

    @property
    def steps(self):
        d = self.issue.description
        steps = re.split("testable", d, flags=re.IGNORECASE)
        if len(steps) == 0:
            return None
