
from django.contrib.auth.decorators import login_required, permission_required
from django.core.urlresolvers import reverse
from django.core.exceptions import PermissionDenied
from django.contrib import messages
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect
from django.http import  Http404, HttpResponseForbidden
from django.shortcuts import render_to_response, get_object_or_404, redirect, render
import logging
logger = logging.getLogger(__name__)


def home(request, template="aw/home.html"):
    context = {}
    return render_to_response(template, context, context_instance=RequestContext(request))
