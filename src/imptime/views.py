from invoicing import models
from django.db.models import Sum, Count, Q, F, Max, Min
import copy
from phantom_pdf.generator import create_url_from_query_dict, render_url_to_pdf
import datetime
from timepiece import models as timepiece
from django.core.files.base import ContentFile
from django.contrib.auth import login as django_login, load_backend
from django.shortcuts import render_to_response, get_object_or_404, redirect, render
from django.contrib.auth.decorators import login_required, permission_required
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse, resolve
from django.template import RequestContext
from django.contrib import messages


@login_required
def home(request, template="imptime/index_react.html", context=None):
    context = context or {}
    return render_to_response(template, context)
