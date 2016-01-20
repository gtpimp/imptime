from django.db import models
from django.forms.models import model_to_dict as _model_to_dict
from datetime import datetime
from api import apidate
import decimal

def model_to_dict_with_date_support(m):
    d = _model_to_dict(m)
    for k,v in d.items():
        if isinstance(v, datetime):
            d[k] = apidate.convert_datetime_to_iso_string(v)
        elif isinstance(v, decimal.Decimal):
            d[k] = float(v)

    return d

class BaseManager(models.Manager):
    
    def get_queryset(self):
        return super(BaseManager, self).get_queryset().filter(deleted=False)


class BaseModel(models.Model):
    class Meta:
        abstract=True
        default_permissions = []

    created = models.DateTimeField()
    modified = models.DateTimeField()
    deleted = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        self.modified = apidate.today_in_utc()
        if self.id is None:
            self.created = self.modified
        super(BaseModel, self).save(*args, **kwargs)
    
    def model_to_dict(self):
        return model_to_dict_with_date_support(self)
