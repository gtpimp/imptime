from django.forms import TypedChoiceField, CharField, IntegerField
from dateutil.relativedelta import relativedelta
from imagekit.models import ImageSpecField, ProcessedImageField
from imagekit.processors import ResizeToFill
from pilkit.processors import ResizeToRatio, ResizeWithAspect
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
        return os.path.join(self.path, unique_path, filename)

class ProtectedForeignKey(models.ForeignKey):
    def __init__(self, *args, **kwargs):
        kwargs['on_delete'] = models.PROTECT
        super(ProtectedForeignKey, self).__init__(*args, **kwargs)

class HiResImageField(models.ImageField):
    def __init__(self, *args, **kwargs):

        if 'null' not in kwargs:
            kwargs['null'] = True
        if 'blank' not in kwargs:
            kwargs['blank'] = True

        super(HiResImageField, self).__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super(HiResImageField, self).deconstruct()
        return name, path, args, kwargs


class LoResImageField(ProcessedImageField):
    def __init__(self, *args, **kwargs):

        super(LoResImageField, self).__init__(processors=[ResizeToRatio(1.0, 1.0)], 
                                              options={'quality': 20},
                                              *args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super(LoResImageField, self).deconstruct()
        return name, path, args, kwargs


class ThumbnailImageField(ProcessedImageField):
    def __init__(self, *args, **kwargs):
        super(ThumbnailImageField, self).__init__(processors=[ResizeWithAspect(150)], 
                                                  options={'quality': 60},
                                                  *args, **kwargs)
        
    def deconstruct(self):
        name, path, args, kwargs = super(ThumbnailImageField, self).deconstruct()
        return name, path, args, kwargs

class MediumResImageField(ImageSpecField):
    def __init__(self, *args, **kwargs):
        super(MediumResImageField, self).__init__(processors=[ResizeWithAspect(1600)], 
                                                  options={'quality': 80},
                                                  *args, **kwargs)
        
