from django.forms import TypedChoiceField, CharField, IntegerField
from dateutil.relativedelta import relativedelta
import re
from django.db import models
from datetime import date
from django.core.exceptions import ValidationError
from django.forms.models import ModelChoiceIterator, ModelChoiceField
from itertools import groupby


class ProtectedForeignKey(models.ForeignKey):
    def __init__(self, *args, **kwargs):
        kwargs['on_delete'] = models.PROTECT
        super(ProtectedForeignKey, self).__init__(*args, **kwargs)
