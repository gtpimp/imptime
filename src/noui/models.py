import datetime
from dateutil.relativedelta import relativedelta
import re
import logging
logger = logging.getLogger(__name__)
from lib.models import BaseModel, BaseManager
from lib.fields import ProtectedForeignKey

from django.db.models import Count
from django.db.models.query import QuerySet
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError, NON_FIELD_ERRORS
from django.db import models
from django.db.models import Q, Avg, Sum, Max, Min, F
from django.utils.datastructures import SortedDict
from re import sub as re_sub
from re import UNICODE as re_UNICODE

from timepiece import timezone
from timepiece import utils
from timepiece import models as timepiece_models

from datetime import timedelta

class NouiCommand(BaseModel):

    name = models.CharField(max_length=255, null=False, blank=True, db_index=True)
    pattern = models.CharField(max_length=255, null=False, blank=True)
    description = models.TextField(null=True, blank=True)
    command_function = models.TextField(null=False, blank=True) # a snippet of python which must define a function called 'go' which takes all the parameters for this command.

    objects = BaseManager()
    objects_original = models.Manager()

    def __unicode__(self):
        return self.name
        
class NouiCommandParameter(BaseModel):
    name = models.CharField(max_length=255, null=False, blank=True)
    var_name = models.CharField(max_length=255, null=False, blank=True)
    command = ProtectedForeignKey(NouiCommand, null=False, blank=True, related_name='parameters')
    pattern = models.CharField(max_length=255, null=False, blank=True)
    search_function = models.CharField(max_length=255, null=False, blank=True) # search function is the name of a global or class static function which will take a string and return an list of objects of the matching type
    description = models.TextField(null=True, blank=True)

    objects = BaseManager()
    objects_original = models.Manager()

    def __unicode__(self):
        return self.name

class NouiBusiness(object):

    @classmethod
    def find(self, search_string, **kwargs):
        b = None
        try:
            b = timepiece_models.Business.objects.filter(pk=search_string).first()
        except Exception:
            pass
        if not b:
            b = timepiece_models.Business.objects.filter(name__icontains=search_string).first()
        if not b:
            b = timepiece_models.Business.objects.filter(description__icontains=search_string).first()
        return b

class NouiProject(object):

    @classmethod
    def find(self, search_string, **kwargs):
        b = None

        filter_args = {}
        if kwargs.get('business'):
            filter_args['business']=kwargs['business']
        
        try:
            b = timepiece_models.Project.objects.filter(pk=search_string, **filter_args).first()
        except Exception:
            pass
        if not b:
            b = timepiece_models.Project.objects.filter(name__icontains=search_string, **filter_args).first()
        if not b:
            b = timepiece_models.Project.objects.filter(short_description__icontains=search_string, **filter_args).first()            
        if not b:
            b = timepiece_models.Project.objects.filter(description__icontains=search_string, **filter_args).first()
        return b

    @classmethod
    def find_state(self, state_string, **kwargs):
        for k,v in timepiece_models.Project.PROJECT_STATUSES:
            if state_string in v.lower():
                return k
        return None

    @classmethod
    def set_state(self, **kwargs):
        project = timepiece_models.Project.objects.get(pk=kwargs['project'])
        project.status2 = kwargs['new_state']
        project.save()
        return { 'msg': "Status of sprint %s changed to %s" % ( project.long_name(), project.status2 ) }
    
