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

def upload_to(subfolder):
    def upload(instance, filename, subfolder=subfolder):
        path = str(uuid.uuid4())
        return os.path.join(subfolder, path, filename)
    return upload

class ProtectedForeignKey(models.ForeignKey):
    def __init__(self, *args, **kwargs):
        kwargs['on_delete'] = models.PROTECT
        super(ProtectedForeignKey, self).__init__(*args, **kwargs)
