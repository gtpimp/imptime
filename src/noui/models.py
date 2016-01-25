import datetime
from dateutil.relativedelta import relativedelta
import re
import json
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

    def model_to_dict(self, include_parameters=False):
        d = super(NouiCommand, self).model_to_dict()
        if include_parameters:
            d['parameters'] = [ x.model_to_dict() for x in self.parameters.order_by("name").all() ]
        return d

class NouiCommandParameter(BaseModel):
    name = models.CharField(max_length=255, null=False, blank=True)
    var_name = models.CharField(max_length=255, null=False, blank=True)
    command = ProtectedForeignKey(NouiCommand, null=False, blank=True, related_name='parameters')
    pattern = models.CharField(max_length=255, null=False, blank=True)
    search_function = models.TextField(max_length=255, null=False, blank=True) # search function is the name of a global or class static function which will take a string and return an list of objects of the matching type
    description = models.TextField(null=True, blank=True)

    objects = BaseManager()
    objects_original = models.Manager()

    def __unicode__(self):
        return self.name
    
class PostedAction(BaseModel):

    ACTION_CHOICES = [ ('waiting', 'Waiting'),
                       ('refused', 'Refused'),
                       ('failed', 'Failed'),
                       ('completed', 'Completed') ]

    ACTION_TYPES = [ ( 'redirect', 'Redirect' ),
                     ( 'javascript', 'Javascript' ),
                     ( 'run_search_result', 'Run search result' ) ]
    
    source_command = ProtectedForeignKey(NouiCommand, null=False, blank=True, related_name='noui_posted_actions')
    target_user = ProtectedForeignKey(User, null=False, blank=True, related_name='noui_posted_actions_as_target', db_index=True)
    target_device = models.CharField(max_length=255, null=True, blank=True)
    source_user = ProtectedForeignKey(User, null=False, blank=True, related_name='noui_posted_actions_as_source')
    human_readable_source_command = models.TextField(null=False, blank=True)
    status = models.CharField(max_length=20, null=False, blank=False, choices=ACTION_CHOICES, db_index=True)
    action_type = models.CharField(max_length=20, null=False, blank=False, choices=ACTION_TYPES)
    action_args = models.TextField(null=True, blank=True) # json
    
    def model_to_dict(self, convert_json_fields_to_json=False):
        d = super(PostedAction, self).model_to_dict()
        if convert_json_fields_to_json and d['action_args']:
            d['action_args'] = json.loads(d['action_args'])
        return d
        