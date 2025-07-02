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
from django.urls import reverse, resolve
from django.template import RequestContext
from django.contrib import messages
from timepiece.models import Issue, IssueStatus
from timepiece import forms as timepiece_forms
from testable.models import Testable, TestableSession, TestableResult
from testable.forms import TestableFilterForm, TestableSessionCreateForm, TestableSessionSelectForm
import logging
logger = logging.getLogger(__name__)

@login_required
def dashboard(request, business_id, template="testable/testable_dashboard.html", context=None):
    context = context or {}
    business = Business.objects.all().get(pk=business_id)
    context['business'] = business

    new_testable_session_form = TestableSessionCreateForm(request.POST or None)
    testable_session_select_form = TestableSessionSelectForm(request.POST or None, business=business)
    
    if 'name' in request.POST and new_testable_session_form.is_valid() and new_testable_session_form['name']:
        testable_session = new_testable_session_form.save(commit=False)
        testable_session.business = business
        testable_session.created_by = request.user
        testable_session.save()
        new_testable_session_form.save_m2m()
        return HttpResponseRedirect(reverse('testable:testable_session', args=[testable_session.id]))
        
    if 'testable_session' in request.POST and testable_session_select_form.is_valid():
        testable_session = testable_session_select_form.cleaned_data['testable_session']
        return HttpResponseRedirect(reverse('testable:testable_session', args=[testable_session.id]))

    context['new_testable_session_form'] = new_testable_session_form
    context['testable_session_select_form'] = testable_session_select_form
    
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None or not bp.has_view_testables:
        raise PermissionDenied
    return render(request, template, context)

@login_required
def test_session(request, testable_session_id, template="testable/test_session.html", context=None):
    context = context or {}
    testable_session = TestableSession.objects.get(pk=testable_session_id)
    business = testable_session.business
    context['business'] = business
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None or not bp.has_view_testables:
        raise PermissionDenied

    filter_form = TestableFilterForm(request.GET or {}, business=business)
    if filter_form.is_valid():
        testables = filter_form.filter(testable_session=testable_session)
        context['active_filter'] = filter_form.cleaned_data
    else:
        testables = Testable.objects.none()
        context['active_filter'] = None
    context['filter_form'] = filter_form
    context['testables'] = testables
    context['testable_session'] = testable_session
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
def test_passed(request, testable_session_id, testable_id):
    return _update_test_status(request, testable_session_id, testable_id, 'passed', 'internal_qa_passed')

@login_required
@csrf_exempt
def test_failed(request, testable_session_id, testable_id):
    return _update_test_status(request, testable_session_id, testable_id, 'failed', 'reopened')

@login_required
@csrf_exempt
def test_untested(request, testable_session_id, testable_id):
    return _update_test_status(request, testable_session_id, testable_id, 'untested', None)

def _update_test_status(request, testable_session_id, testable_id, status, new_issue_status_name):
    context = {}
    testable = Testable.objects.get(pk=testable_id)
    testable_session = TestableSession.objects.get(pk=testable_session_id)
    business = testable.issue.project.business
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None or not bp.has_view_testables:
        raise PermissionDenied

    testable_result = TestableResult.objects.filter(testable_session=testable_session, testable=testable).first()
    if testable_result is None:
        testable_result = TestableResult(testable_session=testable_session, testable=testable)
    testable_result.checked_by = request.user
    testable_result.checked_at = timezone.now()
    testable_result.status = status
    testable_result.save()
    
    if new_issue_status_name is not None:
        issue = testable.issue
        old_status = issue.status2
        issue.status2 = IssueStatus.objects.get_or_create(name=new_issue_status_name, business=business)[0]
        issue.save()
        timepiece.IssueHistory.add_history(request.user, issue, "changed status because of test", old_status, issue.status)
    
    context['status'] = 'success'
    return HttpResponse(json.dumps(context))

@login_required
@csrf_exempt
def test_remove(request, testable_session_id, testable_id):
    context = {}
    testable = Testable.objects.get(pk=testable_id)
    testable_session = TestableSession.objects.get(pk=testable_session_id)
    business = testable.issue.project.business
    bp = BusinessPermissions.for_user(request.user, business=business)
    if bp is None or not bp.has_view_testables:
        raise PermissionDenied

    testable_result = TestableResult.objects.filter(testable_session=testable_session, testable=testable).first()
    testable_result.delete()
    context['status'] = 'success'
    return HttpResponse(json.dumps(context))
