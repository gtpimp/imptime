from timepiece.models import Business, BusinessPermissions
from django.db.models import Sum, Count, Q, F, Max, Min
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
import json
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
from timepiece.models import Issue, IssueStatus
from timepiece import forms as timepiece_forms
from testable.models import Testable, TestEvent
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
    if bp is None or not bp.has_view_testables:
        raise PermissionDenied
    return render(request, template, context)

@login_required
def test_session(request, business_id, template="testable/test_session.html", context=None):
    context = context or {}
    business = Business.objects.all().get(pk=business_id)
    context['business'] = business
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None or not bp.has_view_testables:
        raise PermissionDenied

    filter_form = TestableFilterForm(request.GET or {}, business=business)
    if filter_form.is_valid():
        testables = filter_form.filter()
        context['active_filter'] = filter_form.cleaned_data
    else:
        testables = Testable.objects.none()
        context['active_filter'] = None
    context['filter_form'] = filter_form
    context['testables'] = testables
    return render(request, template, context)

@login_required
@csrf_exempt
def exclude_from_regression_test(request, testable_id, context=None):
    context = context or {}
    testable = Testable.objects.get(pk=testable_id)
    business = testable.issue.project.business
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None or not bp.has_view_testables:
        raise PermissionDenied
    testable.include_in_regression_test = False
    testable.save()
    context['status'] = 'success'
    return HttpResponse(json.dumps(context))

@login_required
@csrf_exempt
def include_in_regression_test(request, testable_id, context=None):
    context = context or {}
    testable = Testable.objects.get(pk=testable_id)
    business = testable.issue.project.business
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None or not bp.has_view_testables:
        raise PermissionDenied
    testable.include_in_regression_test = True
    testable.save()
    context['status'] = 'success'
    return HttpResponse(json.dumps(context))

@login_required
@csrf_exempt
def exclude_from_regression_test_for_issue(request, issue_id, context=None):
    context = context or {}
    issue = Issue.objects.get(pk=issue_id)
    business = issue.project.business
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None or not bp.has_view_testables:
        raise PermissionDenied
    for testable in issue.testables.all():
        testable.include_in_regression_test = False
        testable.save()
    context['status'] = 'success'
    return HttpResponse(json.dumps(context))

@login_required
@csrf_exempt
def include_in_regression_test_for_issue(request, issue_id, context=None):
    context = context or {}
    issue = Issue.objects.get(pk=issue_id)
    business = issue.project.business
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None or not bp.has_view_testables:
        raise PermissionDenied

    for testable in issue.testables.all():
        testable.include_in_regression_test = True
        testable.save()
    context['status'] = 'success'
    return HttpResponse(json.dumps(context))

@login_required
@csrf_exempt
def test_passed(request, testable_id):
    return _update_test_status(request, testable_id, 'passed', 'internal_qa_passed')

@login_required
@csrf_exempt
def test_failed(request, testable_id):
    return _update_test_status(request, testable_id, 'failed', 'reopened')

@login_required
@csrf_exempt
def test_unknown(request, testable_id):
    return _update_test_status(request, testable_id, 'unknown', None)

def _update_test_status(request, testable_id, status, new_issue_status_name):
    context = {}
    testable = Testable.objects.get(pk=testable_id)
    business = testable.issue.project.business
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None or not bp.has_view_testables:
        raise PermissionDenied

    TestEvent.objects.filter(testable=testable).update(is_latest=False)
    TestEvent.objects.create(testable=testable,
                             checked_by=request.user,
                             checked_at=timezone.now(),
                             status=status,
                             is_latest=True)

    if new_issue_status_name is not None:
        issue = testable.issue
        old_status = issue.status2
        issue.status2 = IssueStatus.objects.get_or_create(name=new_issue_status_name, business=business)[0]
        issue.save()
        timepiece.IssueHistory.add_history(request.user, issue, "changed status because of test", old_status, issue.status)
    
    context['status'] = 'success'
    return HttpResponse(json.dumps(context))
