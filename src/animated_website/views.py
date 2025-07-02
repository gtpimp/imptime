
from django.contrib.auth.decorators import login_required, permission_required
from django.urls import reverse
from django.core.exceptions import PermissionDenied
from django.contrib import messages
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect
from django.http import  Http404, HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
import logging
logger = logging.getLogger(__name__)


def home(request, template="aw/home.html"):
    context = {}
    return render(request, template, context)
