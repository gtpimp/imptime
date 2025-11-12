import logging
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import pprint
from collections import OrderedDict
import zipfile
from django.urls import reverse
from io import StringIO
from rest_framework.renderers import JSONRenderer
from lib.date_helper import today_in_local_timezone
import json
from django.conf import settings
import os
from django.shortcuts import render, redirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
logger = logging.getLogger(__name__)
from channels import Group

from refresh_consumer import REFRESH_GROUP_NAME

@login_required
def force_refresh(request):
    payload = { 'action_type': '__all__' }
    Group(REFRESH_GROUP_NAME).send({"text":json.dumps(payload)})
    return HttpResponse("Sent to all listeners")
