from django.db import models
from django.forms.models import model_to_dict as _model_to_dict
from datetime import datetime, date
from api import apidate
import decimal
from django.conf import settings
from django.utils import timezone

def model_to_dict_with_date_support(m):
    d = _model_to_dict(m)
    for k,v in d.items():
        if isinstance(v, datetime):
            d[k] = apidate.convert_datetime_to_iso_string(v)
        elif isinstance(v, date):
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

    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    deleted = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        self.modified = apidate.today_in_utc()
        if self.id is None:
            self.created = self.modified
        super(BaseModel, self).save(*args, **kwargs)
    
    def model_to_dict(self):
        return model_to_dict_with_date_support(self)

    @property
    def share_ref_expiry(self):
        if not hasattr(self, "share_ref_created_at") or self.share_ref_created_at is None:
            return None
        return self.share_ref_created_at + timezone.timedelta(days=settings.SHARE_REF_EXPIRY_DAYS)
 
