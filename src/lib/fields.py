from django.forms import TypedChoiceField, CharField, IntegerField
from dateutil.relativedelta import relativedelta
import re
import uuid
import os
from django.db import models
from datetime import date
from django.core.exceptions import ValidationError
from django.forms.models import ModelChoiceIterator, ModelChoiceField
from itertools import groupby
from django.utils.deconstruct import deconstructible

@deconstructible
class UploadTo(object):
    def __init__(self, sub_path):
        self.path = sub_path

    def __call__(self, instance, filename):
        unique_path = str(uuid.uuid4())
        return os.path.join(unique_path, self.path, filename)


class ProtectedForeignKey(models.ForeignKey):
    def __init__(self, *args, **kwargs):
        kwargs['on_delete'] = models.PROTECT
        super(ProtectedForeignKey, self).__init__(*args, **kwargs)
