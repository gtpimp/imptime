from timepiece.models import Business, BusinessPermissions
from django.db.models import Sum, Count, Q, F, Max, Min
from django.core.exceptions import PermissionDenied
import copy
import datetime
from timepiece import models as timepiece
from django.core.files.base import ContentFile
from django.contrib.auth import login as django_login, load_backend
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth.decorators import login_required, permission_required
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse, resolve
from django.template import RequestContext
from django.contrib import messages
from timepiece import forms as timepiece_forms
from testable.forms import TestableFilterForm
import logging
logger = logging.getLogger(__name__)

@login_required
def dashboard(request, business_id, template="testable/testable_dashboard.html", context=None):
    context = context or {}
    business = Business.objects.all().get(pk=business_id)
    context['business'] = business
    context['filter_form'] = TestableFilterForm(business=business)
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None:
        raise PermissionDenied
    return render(request, template, context)

@login_required
def test_session(request, business_id, template="testable/test_session.html", context=None):
    context = context or {}
    business = Business.objects.all().get(pk=business_id)
    context['business'] = business
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None:
        raise PermissionDenied

    filter_form = TestableFilterForm(request.POST or None, business=business)
    if filter_form.is_valid():
        testables = filter_form.filter()
    else:
        testables = None
    context['filter_form'] = filter_form
    context['active_filter'] = filter_form.cleaned_data
    context['testables'] = testables
    return render(request, template, context)
    
