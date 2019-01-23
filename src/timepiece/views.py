import random
import markdown
from django.http import StreamingHttpResponse
from django.core.files.storage import default_storage as storage
import requests
from lib.file_helper import download_media
import os
import time
from mailqueue.mailqueue_helper import queue_email, queue_admin_email
from caldav_helper import CalDavHelper
from phantom_pdf.generator import create_url_from_query_dict, render_url_to_pdf
from django.contrib.humanize.templatetags.humanize import intcomma
import urllib
import api
from invoicing.models import Invoice, Quote, ClientInvoiceDetails
from django.contrib.auth import login as django_login, load_backend
from django.core.files.base import ContentFile
import csv
from exporter import CSVMixin, CSVSprintExport, CSVTimesheetExport
from interface_plugin import get_interface_plugin
import timings
from xhtml2pdf import pisa
import operator
from dateutil.rrule import DAILY, WDAYMASK, rrule, MO,TU,WE,TH,FR
import json
import jsonpickle
from django.db import connection
from pdf import render_to_pdf
import re
import datetime
from django.template import Template
import math
import urllib
import urlparse
from copy import deepcopy, copy
from collections import defaultdict
import time

from decimal import Decimal, ROUND_HALF_UP
from dateutil.relativedelta import relativedelta
from itertools import groupby

from django.contrib import messages
from django.template import RequestContext
from django.shortcuts import (get_object_or_404, redirect,
                              render)
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse, resolve
from django.http import HttpResponse, HttpResponseRedirect
from django.http import  Http404, HttpResponseForbidden
from django.contrib.auth.decorators import login_required, permission_required, user_passes_test
from django.contrib.auth.models import User
from django.contrib.auth import models as auth_models
from django.db.models import Sum, Count, Q, F, Max, Min
from django.db import transaction
from django.db import DatabaseError
from django.conf import settings
from collections import OrderedDict
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import TemplateView
from django.views.generic import UpdateView, ListView, DetailView, View
from django.utils.decorators import method_decorator
from django.core import serializers, exceptions
from django.contrib.contenttypes.models import ContentType

try:
    from django.utils import timezone
except ImportError:
    from timepiece import timezone

from timepiece.utils import render_with, reverse_lazy, get_week_start, percentage

from timepiece import models as timepiece
from timepiece import utils
from timepiece import forms as timepiece_forms
from timepiece.templatetags.timepiece_tags import seconds_to_hours
from timepiece.templatetags.timepiece_tags import get_active_hours
from testable.forms import TestableFormSet
from testable.models import Testable
from emacs_importer import report_helper
from emacs_importer import models as bamboo_models
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import logging

from slideshow.views import calculate_progress_ratio, calculate_dev_hours_stats

logger = logging.getLogger('timepiece_view')

def permission_required_or_staff(perm, login_url=None, raise_exception=False):
    def check_perms(user):
        if user.is_staff:
            return True

        if not isinstance(perm, (list, tuple)):
            perms = (perm, )
        else:
            perms = perm
        # First check if the user has the permission (even anon users)
        if user.has_perms(perms):
            return True
        # In case the 403 handler should be called raise the exception
        if raise_exception:
            raise PermissionDenied
        # As the last resort, show the login form
        return False
    return user_passes_test(check_perms, login_url=login_url)


@login_required
def home(request, template="timepiece/home.html"):
    context = {}
    return render(request, template, context)

@login_required
def quick_search(request):
    if request.GET:
        form = timepiece_forms.QuickSearchForm(request.GET)
        if form.is_valid():
            return HttpResponseRedirect(form.save())
    return render(request, 'timepiece/search_results.html', {
            'form': form,
        }
    )


@login_required
@render_with('timepiece/landing_page.html')
def landing_page(request):
    return {}

@login_required
@render_with('timepiece/time-sheet/dashboard.html')
def view_entries(request):
    view_entries = False
    if request.user.has_perm('timepiece.can_clock_in'):
        view_entries = True
    week_start = utils.get_week_start()
    time_q = Q(end_time__gte=week_start) | Q(end_time__isnull=True)
    entries = timepiece.Entry.objects.select_related(
        'issue__project__business',
    ).filter(
        time_q,
        user=request.user
    ).select_related('issue__project', 'activity', 'location')
    today = datetime.date.today()
    assignments = timepiece.ContractAssignment.objects.filter(
        user=request.user,
        user__project_relationships__project=F('contract__project'),
        end_date__gte=today,
        contract__status='current',
    ).order_by('contract__project__type', 'end_date')
    assignments = assignments.select_related('user', 'contract__project__type')
    others_active_entries = timepiece.Entry.objects.filter(
        end_time__isnull=True,
    ).exclude(
        user=request.user,
    ).select_related('user', 'issue__project', 'activity')
    my_active_entries = timepiece.Entry.objects.select_related(
        'issue__project__business',
    ).only(
        'user', 'issue__project', 'activity', 'start_time'
    ).filter(
        user=request.user,
        end_time__isnull=True,
    )

    allocations = []
    allocated_projects = timepiece.Project.objects.none()
#    allocations = timepiece.AssignmentAllocation.objects.during_this_week(
#        request.user
#        ).order_by('assignment__contract__project__name')
#    allocated_projects = allocations.values_list(
#    'assignment__contract__project',)

    project_entries = entries.exclude(
        issue__project__in=allocated_projects,
        end_time__isnull=True
    ).values(
        'issue__project__name', 'issue__project__pk', 'issue__project__business__name'
    ).annotate(sum=Sum('hours'))
    schedule = timepiece.PersonSchedule.objects.filter(
                                    user=request.user)
    this_weeks_entries = entries.order_by('-start_time'). \
        filter(end_time__gte=week_start)
    context = {
        'this_weeks_entries': this_weeks_entries,
        'assignments': assignments,
        'allocations': allocations,
        'schedule': schedule,
        'project_entries': project_entries,
        'others_active_entries': others_active_entries,
        'my_active_entries': my_active_entries,
        'view_entries': view_entries,
    }
    return context


@permission_required('timepiece.can_clock_in')
@login_required
def clock_in(request):
    """For clocking the user into a project"""
    active_entry = timepiece.Entry.objects_original.filter(user=request.user,
                                                  end_time__isnull=True)
    # Should never happen, but just in case.
    if len(active_entry) > 1:
        err_msg = 'You have more than one active entry and must clock out ' \
                  'of these entries before clocking into another.'
        messages.error(request, err_msg)
        return redirect('timepiece-entries')
    active_entry = active_entry[0] if active_entry else None
    initial = dict([(k, v) for k, v in request.GET.items()])
    form = timepiece_forms.ClockInForm(request.POST or None, initial=initial,
                                       user=request.user, active=active_entry)
    if form.is_valid():
        entry = form.save()
        message = 'You have clocked into %s' % entry.issue.project
        messages.info(request, message)
        return HttpResponseRedirect(reverse('timepiece-entries'))
    return render(request, 'timepiece/time-sheet/entry/clock_in.html', {
            'form': form,
            'active': active_entry,
        }
    )


@permission_required('timepiece.can_clock_out')
@login_required
def clock_out(request, entry_id):
    entry = get_object_or_404(
        timepiece.Entry,
        pk=entry_id,
        user=request.user,
        end_time__isnull=True,
    )
    if request.POST:
        form = timepiece_forms.ClockOutForm(request.POST, instance=entry)
        if form.is_valid():
            entry = form.save()
            message = "You've been clocked out."
            messages.info(request, message)
            return HttpResponseRedirect(reverse('timepiece-entries'))
        else:
            message = 'Please correct the errors below.'
            messages.error(request, message)
    else:
        form = timepiece_forms.ClockOutForm(instance=entry)
    context = {
        'form': form,
        'entry': entry,
    }
    return render(request,
        'timepiece/time-sheet/entry/clock_out.html',
        context
    )


@permission_required('timepiece.can_pause')
@login_required
def toggle_paused(request, entry_id):
    """
    Allow the user to pause and unpause their open entries.  If this method is
    invoked on an entry that is not paused, it will become paused.  If this
    method is invoked on an entry that is already paused, it will unpause it.
    Then the user will be redirected to their log entry list.
    """

    try:
        # retrieve the log entry
        entry = timepiece.Entry.objects_original.get(pk=entry_id,
                                  user=request.user,
                                  end_time__isnull=True)
    except:
        # create an error message for the user
        message = 'The entry could not be paused.  Please try again.'
        messages.error(request, message)
    else:
        # toggle the paused state
        entry.toggle_paused()

        # save it
        entry.save()

        if entry.is_paused:
            action = 'paused'
        else:
            action = 'resumed'

        delta = timezone.now() - entry.start_time
        seconds = delta.seconds - entry.seconds_paused
        seconds += delta.days * 86400

        if seconds < 3600:
            seconds /= 60.0
            duration = "You've clocked %d minutes." % seconds
        else:
            seconds /= 3600.0
            duration = "You've clocked %.2f hours." % seconds

        message = 'The log entry has been %s. %s' % (action, duration)

        # create a message that can be displayed to the user
        messages.info(request, message)

    # redirect to the log entry list
    return HttpResponseRedirect(reverse('timepiece-entries'))

@render_with('timepiece/time-sheet/entry/import_entries.html')
@permission_required('timepiece.can_clock_in')
@login_required
def import_entries(request):
    form = timepiece_forms.ImportEntriesForm(request.user, request.POST)

    context = {}

    if request.POST and form.is_valid():
        context.update(form.save())
        context['imported'] = True

    context['form'] = form
    return context

@permission_required('timepiece.change_entry')
@render_with('timepiece/time-sheet/entry/add_update_entry.html')
@login_required
def create_edit_entry(request, entry_id=None):
    if entry_id:
        try:
            entry = timepiece.Entry.objects_original.get(
                pk=entry_id,
                user=request.user
            )
            if not entry.is_editable:
                raise Http404

        except timepiece.Entry.DoesNotExist:
            raise Http404

    else:
        entry = None

    if request.POST:
        form = timepiece_forms.AddUpdateEntryForm(
            request.POST,
            instance=entry,
            user=request.user,
        )
        if form.is_valid():
            entry = form.save()
            if entry_id:
                message = 'The entry has been updated successfully.'
            else:
                message = 'The entry has been created successfully.'
            messages.info(request, message)
            return HttpResponseRedirect(reverse('timepiece-entries'))
        else:
            message = 'Please fix the errors below.'
            messages.error(request, message)
    else:
        initial = dict([(k, request.GET[k]) for k in request.GET.keys()])
        form = timepiece_forms.AddUpdateEntryForm(
            instance=entry,
            user=request.user,
            initial=initial,
        )

    return {
        'form': form,
        'entry': entry,
    }


@permission_required('timepiece.view_payroll_summary')
@login_required
def reject_entry(request, entry_id):
    """
    Admins can reject an entry that has been verified or approved but not
    invoiced to set its status to 'unverified' for the user to fix.
    """
    user = request.user
    return_url = request.REQUEST.get('next', reverse('timepiece-entries'))
    try:
        entry = timepiece.Entry.objects_original.get(pk=entry_id)
    except:
        message = 'No such log entry.'
        messages.error(request, message)
        return redirect(return_url)

    if entry.status == 'unverified' or entry.status == 'invoiced':
        msg_text = 'This entry is unverified or is already invoiced'
        messages.error(request, msg_text)
        return redirect(return_url)

    if request.POST.get('Yes'):
        entry.status = 'unverified'
        entry.save()
        msg_text = "The entry's status was set to unverified"
        messages.info(request, msg_text)
        return redirect(return_url)
    return render(request, 'timepiece/time-sheet/entry/reject_entry.html', {
                                  'entry': entry,
                                  'next': request.REQUEST.get('next'),
                              })


@permission_required('timepiece.delete_entry')
@login_required
def delete_entry(request, entry_id):
    """
    Give the user the ability to delete a log entry, with a confirmation
    beforehand.  If this method is invoked via a GET request, a form asking
    for a confirmation of intent will be presented to the user.  If this method
    is invoked via a POST request, the entry will be deleted.
    """

    try:
        # retrieve the log entry
        entry = timepiece.Entry.objects_original.get(pk=entry_id,
                                  user=request.user)
    except:
        # entry does not exist
        message = 'No such log entry.'
        messages.info(request, message)
        return HttpResponseRedirect(reverse('timepiece-entries'))

    if request.method == 'POST':
        key = request.POST.get('key', None)
        if key and key == entry.delete_key:
            entry.delete()
            message = 'Entry deleted.'
            messages.info(request, message)
            return HttpResponseRedirect(reverse('timepiece-entries'))
        else:
            message = 'You are not authorized to delete this entry!'
            messages.error(request, message)

    return render(request, 'timepiece/time-sheet/entry/delete_entry.html',
                              {'entry': entry})


@permission_required('timepiece.view_entry_summary')
@render_with('timepiece/time-sheet/reports/general_ledger.html')
@login_required
def summary(request, username=None):
    date = timezone.now() - relativedelta(months=1)
    from_date = utils.get_month_start(date).date()
    to_date = from_date + relativedelta(months=1)

    form = timepiece_forms.YearMonthForm(request.GET or None, initial={
        'month': from_date.month,
        'year': from_date.year
    })

    if form.is_valid():
        from_date, to_date = form.save()

    entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).values(
        'issue__project__id',
        'issue__project__business__id',
        'issue__project__business__name',
        'issue__project__name',
    ).order_by(
        'issue__project__id',
        'issue__project__business__id',
        'issue__project__business__name',
        'issue__project__name',
    )

    dates = Q()
    if from_date:
        dates &= Q(start_time__gte=from_date)
    if to_date:
        dates &= Q(end_time__lte=to_date)
    project_totals = entries.filter(dates).annotate(total_hours=Sum('hours'))
    project_totals = project_totals.order_by('issue__project__name')
    total_hours = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(dates).aggregate(
        hours=Sum('hours')
    )['hours']
    people_totals = timepiece.Entry.objects_original.filter_by_logged_in_user(request.user).values('user', 'user__first_name',
                                                                                       'user__last_name')
    people_totals = people_totals.order_by('user__last_name').filter(dates)
    people_totals = people_totals.annotate(total_hours=Sum('hours'))

    #business_per_person_totals = entries.filter(dates).values('user__username', 'project__business__name').annotate(total_hours=Sum('hours'))
    business_per_person_totals = entries.filter(dates).values('user__username', 'issue__project__business__name').annotate(total_hours=Sum('hours')).order_by('issue__project__business__name')
    business_per_project_per_person_totals = entries.filter(dates).values('user__username', 'issue__project__name', 'issue__project__business__name').annotate(total_hours=Sum('hours')).order_by('issue__project__name')

    context = {
        'form': form,
        'project_totals': project_totals,
        'business_per_person_totals' : business_per_person_totals,
        'business_per_project_per_person_totals': business_per_project_per_person_totals,
        'total_hours': total_hours,
        'people_totals': people_totals,
        'from_date': from_date
    }
    return context



@login_required
def view_summary(request,user_id, include_older_businesses=False):
    all_businesses = timepiece.Business.businesses_in_desc_order_of_use(request.user)

    bus_info = []

    current_businesses = []
    old_businesses = []

    current_old_threshold = timezone.now() - relativedelta(months=3)
    for business in all_businesses:
        bus_info = {'id': business.id, 'name': business.name }
        end_time = business.end_time
        if end_time is not None and end_time > current_old_threshold:
            current_businesses.append(bus_info)
        else:
            old_businesses.append(bus_info)

    if not include_older_businesses:
        old_businesses = None

    # ##
    #current_businesses = [timepiece.Business.objects.get(pk=29)]
    #old_businesses = None
    # ##

    context = { 'current_businesses':current_businesses,
                'old_businesses':old_businesses }
    return render(request, 'timepiece/time-sheet/people/projects.html',
                              context)

@login_required
def get_project_card_for_business(request,business_id, project_id):

    try:
        business = timepiece.Business.objects.get(id = business_id)
    except timepiece.Business.DoesNotExist:
        business = None

    project = timepiece.Project.objects.get(pk = project_id)

    project.recalc_secondary_estimates()
    project.calculate_new_stats(request.user)

    context = { 'business':business,
                'current_business':business,
                'current_user':request.user,
                'project':project,
                'quotes': Quote.objects.filter(project=project).order_by("accepted_at", "sent_to_client_at"),
                'invoices': Invoice.objects\
                            .filter_by_logged_in_user(request.user)\
                            .filter(project=project).order_by("invoice_number"),
                'business_permissions_by_user':timepiece.BusinessPermissions.by_user(business)
                }
    return render(request, 'timepiece/project/card.html',
                              context)


@login_required
def get_project_card(request,business_id,index=None):

    if index is None:
        page_start = 1
        num_per_page = 1
    else:
        page_start = int(index)
        num_per_page = 8

    try:
        business = timepiece.Business.objects.get(id = business_id)
    except timepiece.Business.DoesNotExist:
        business = None

    projects = timepiece.Project.projects_in_desc_order_of_use(int(business_id))
    if len(projects)==0:
        projects = timepiece.Project.objects.filter(business=business).order_by("-id")

    project = projects[0] if len(projects)>0 else None

    if index is not None:
        older_projects = Paginator(projects, num_per_page).page(page_start)
    else:
        older_projects = None


    context = { 'business':business,
                'current_business':business,
                'current_user':request.user,
                'project':project,
                'older_projects':older_projects,
                'expand_older':index is not None,
                'business_permissions_by_user':timepiece.BusinessPermissions.by_user(business)
                }

    return render(request, 'timepiece/project/card.html',
                              context)


@login_required
def view_person_time_sheet(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    if not (request.user.has_perm('timepiece.view_entry_summary') or \
        user.pk == request.user.pk):
        return HttpResponseForbidden('Forbidden')
    today_reset = utils.add_timezone(datetime.datetime.today())
    today_reset = today_reset.replace(hour=0, minute=0, second=0, \
        microsecond=0)
    from_date = utils.get_month_start(today_reset)
    to_date = from_date + relativedelta(months=1)
    can_view_summary = request.user and \
        request.user.has_perm('timepiece.view_entry_summary')
    form = timepiece_forms.UserYearMonthForm if can_view_summary else \
        timepiece_forms.YearMonthForm
    year_month_form = form(request.GET or None)
    if year_month_form.is_valid():
        if can_view_summary:
            from_date, to_date, form_user = year_month_form.save()
            is_update = request.GET.get('yearmonth', None)
            if form_user and is_update:
                url = reverse('view_person_time_sheet', args=(form_user.pk,))
                # Do not use request.GET in urlencode in case it has the
                # yearmonth parameter (redirect loop otherwise)
                request_data = {
                    'month': from_date.month,
                    'year': from_date.year,
                    'user': form_user.pk
                }
                url += '?{0}'.format(urllib.urlencode(request_data))
                return HttpResponseRedirect(url)
        else:
            from_date, to_date = year_month_form.save()
    entries_qs = timepiece.Entry.objects.filter(user=user)
    month_qs = entries_qs.timespan(from_date, span='month')
    extra_values = ('start_time', 'end_time', 'comments', 'seconds_paused', 'issue__project__status3__name',
            'id', 'location__name', 'issue__project__name', 'activity__name', 'issue__project__business__name',
            'status')
    month_entries = month_qs.date_trunc('month', extra_values)
    # For grouped entries, back date up to the start of the week.
    first_week = utils.get_week_start(from_date)
    month_week = first_week + datetime.timedelta(weeks=1)
    grouped_qs = entries_qs.timespan(first_week, to_date=to_date)
    intersection = grouped_qs.filter(start_time__lt=month_week,
        start_time__gte=from_date)
    # If the month of the first week starts in the previous
    # month and we dont have entries in that previous ISO
    # week, then update the first week to start at the first
    # of the actual month
    if not intersection and first_week.month < from_date.month:
        grouped_qs = entries_qs.timespan(from_date, to_date=to_date)
    grouped_totals = utils.grouped_totals(grouped_qs) if month_entries else ''
    project_entries = month_qs.order_by().values(
        'issue__project__name', 'issue__project__business__name').annotate(sum=Sum('hours')).order_by('-sum')
    summary = timepiece.Entry.summary(user, from_date, to_date)
    show_approve = show_verify = False
    if request.user.has_perm('timepiece.change_entry') or \
        user == request.user:
        statuses = list(month_qs.values_list('status', flat=True))
        total_statuses = len(statuses)
        unverified_count = statuses.count('unverified')
        verified_count = statuses.count('verified')
        approved_count = statuses.count('approved')
        show_verify = unverified_count != 0
    if request.user.has_perm('timepiece.change_entry'):
        show_approve = verified_count + approved_count == total_statuses and verified_count > 0 and total_statuses != 0
    context = {
        'year_month_form': year_month_form,
        'from_date': from_date,
        'to_date': to_date - datetime.timedelta(days=1),
        'show_verify': show_verify,
        'show_approve': show_approve,
        'timesheet_user': user,
        'entries': month_entries,
        'grouped_totals': grouped_totals,
        'project_entries': project_entries,
        'summary': summary,
    }
    return render(request, 'timepiece/time-sheet/people/view.html',
        context)


@login_required
def change_person_time_sheet(request, action, user_id, from_date):
    user = get_object_or_404(User, pk=user_id)
    admin_verify = request.user.has_perm('timepiece.view_entry_summary')
    perm = True

    if not admin_verify and action == 'verify' and user != request.user:
        perm = False
    if not admin_verify and action == 'approve':
        perm = False

    if not perm:
        return HttpResponseForbidden('Forbidden: You cannot {0} this ' \
            'timesheet'.format(action))

    try:
        from_date = utils.add_timezone(
            datetime.datetime.strptime(from_date, '%Y-%m-%d'))
    except (ValueError, OverflowError):
        raise Http404
    to_date = from_date + relativedelta(months=1)
    entries = timepiece.Entry.objects_original.filter(user=user_id,
                                             end_time__gte=from_date,
                                             end_time__lt=to_date)
    active_entries = timepiece.Entry.objects_original.filter(
        user=user_id,
        start_time__lt=to_date,
        end_time=None,
        status='unverified'
    )
    filter_status = {
        'verify': 'unverified',
        'approve': 'verified',
    }
    entries = entries.filter(status=filter_status[action])

    return_url = reverse('view_person_time_sheet', kwargs={'user_id': user_id})
    return_url += '?%s' % urllib.urlencode({
        'year': from_date.year,
        'month': from_date.month,
    })
    if active_entries:
        msg = 'You cannot verify/approve this timesheet while the user {0} ' \
            'has an active entry. Please have them close any active ' \
            'entries.'.format(user.get_full_name())
        messages.error(request, msg)
        return redirect(return_url)
    if request.POST.get('do_action') == 'Yes':
        update_status = {
            'verify': 'verified',
            'approve': 'approved',
        }
        entries.update(status=update_status[action])
        messages.info(request,
            'Your entries have been %s' % update_status[action])
        return redirect(return_url)
    hours = entries.all().aggregate(s=Sum('hours'))['s']
    if not hours:
        msg = 'You cannot verify/approve a timesheet with no hours'
        messages.error(request, msg)
        return redirect(return_url)
    context = {
        'action': action,
        'timesheet_user': user,
        'from_date': from_date,
        'to_date': to_date - datetime.timedelta(days=1),
        'return_url': return_url,
        'hours': hours,
    }
    return render(request, 'timepiece/time-sheet/people/change_status.html',
        context)


@login_required
def confirm_invoice_project(request, project_id, to_date, from_date=None):
    if not request.user.has_perm('timepiece.generate_project_invoice'):
        return HttpResponseForbidden('Forbidden')
    try:
        to_date = utils.add_timezone(
            datetime.datetime.strptime(to_date, '%Y-%m-%d'))
        if from_date:
            from_date = utils.add_timezone(
                datetime.datetime.strptime(from_date, '%Y-%m-%d'))
        else:
            from_date = None
    except (ValueError, OverflowError):
        raise Http404
    project = get_object_or_404(timepiece.Project, pk=project_id)
    initial = {
        'project': project,
        'user': request.user,
        'from_date': from_date,
        'to_date': to_date,
    }
    entries_query = {
        'status': "approved",
        'end_time__lt': to_date + relativedelta(days=1),
        'issue__project__id': project.id
    }
    if from_date:
        entries_query.update({'end_time__gte': from_date})
    invoice_form = timepiece_forms.InvoiceForm(request.POST or None,
                                               initial=initial)
    if request.POST and invoice_form.is_valid():
        invoice = invoice_form.save()
        entries = timepiece.Entry.objects_original.filter_by_logged_in_user(request.user).filter(**entries_query)
        entries.update(status=invoice.status, entry_group=invoice)
        return HttpResponseRedirect(reverse('view_invoice', args=[invoice.pk]))
    else:
        entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(**entries_query)
        entries = entries.order_by('start_time')
        if not entries:
            raise Http404

    totals = timepiece.HourGroup.objects.summaries(entries)
    template = 'timepiece/time-sheet/invoice/confirm.html'
    return render(template, {
        'invoice_form': invoice_form,
        'entries': entries.select_related(),
        'project': project,
        'totals': totals,
        'from_date': from_date,
        'to_date': to_date,
    })


@permission_required('timepiece.change_entrygroup')
@login_required
def invoice_projects(request):
    date = utils.add_timezone(datetime.datetime.today())
    to_date = utils.get_month_start(date).date()
    from_date = None
    defaults = {
        'to_date': (to_date - relativedelta(days=1)).strftime('%d/%m/%Y'),
    }
    date_form = timepiece_forms.DateForm(request.GET or defaults)
    if request.GET and date_form.is_valid():
        from_date, to_date = date_form.save()
    datesQ = Q()
    datesQ &= Q(end_time__gte=from_date)  if from_date else Q()
    datesQ &= Q(end_time__lt=to_date)  if to_date else Q()
    entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(datesQ)
    project_totals = entries.filter(status='approved',
        issue__project__type__billable=True, issue__project__status__billable=True).values(
        'issue__project__type__pk', 'issue__project__type__label', 'issue__project__name', 'hours',
        'issue__project__pk', 'status', 'issue__project__status__label', 'issue__project__business__name',
    ).annotate(s=Sum('hours')).order_by('issue__project__type__label',
                                        'issue__project__name', 'status')
    return render(request,
        'timepiece/time-sheet/invoice/make_invoice.html', {
        'date_form': date_form,
        'project_totals': project_totals if to_date else [],
        'to_date': to_date - relativedelta(days=1) if to_date else '',
        'from_date': from_date,
    })


class InvoiceList(ListView):
    template_name = 'timepiece/time-sheet/invoice/list.html'
    context_object_name = 'invoices'
    queryset = timepiece.EntryGroup.objects.all().order_by('-created')

    @method_decorator(permission_required('timepiece.change_entrygroup'))
    def dispatch(self, *args, **kwargs):
        return super(InvoiceList, self).dispatch(*args, **kwargs)


class InvoiceDetail(DetailView):
    template_name = 'timepiece/time-sheet/invoice/view.html'
    model = timepiece.EntryGroup
    context_object_name = 'invoice'

    @method_decorator(permission_required('timepiece.change_entrygroup'))
    def dispatch(self, *args, **kwargs):
        return super(InvoiceDetail, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(InvoiceDetail, self).get_context_data(**kwargs)
        invoice = context['invoice']
        entries = invoice.entries.order_by('start_time').select_related()
        return {
            'invoice': invoice,
            'entries': entries,
            'totals': timepiece.HourGroup.objects.summaries(entries),
            'from_date': invoice.start,
            'to_date': invoice.end,
            'project': invoice.project,
        }


class InvoiceEntryDetail(InvoiceDetail):
    template_name = 'timepiece/time-sheet/invoice/view_entries.html'

    def get_context_data(self, **kwargs):
        context = super(InvoiceEntryDetail, self).get_context_data(**kwargs)
        entries = context['entries']
        context.update({
            'total': entries.aggregate(hours=Sum('hours'))['hours'],
        })
        return context


class InvoiceCSV(CSVMixin, InvoiceDetail):

    def get_filename(self, context):
        invoice = context['invoice']
        project = str(invoice.project).replace(' ', '_')
        end_day = invoice.end.strftime("%d-%m-%Y")
        return "Invoice-{0}-{1}".format(project, end_day)

    def convert_context_to_csv(self, context):
        rows = []
        rows.append([
            'Date',
            'Weekday',
            'Name',
            'Location',
            'Time In',
            'Time Out',
            'Breaks',
            'Hours',
        ])
        for entry in context['entries']:
            data = [
                entry.start_time.strftime('%x'),
                entry.start_time.strftime('%A'),
                entry.user.get_full_name(),
                entry.location,
                entry.start_time.strftime('%X'),
                entry.end_time.strftime('%X'),
                seconds_to_hours(entry.seconds_paused),
                entry.hours,
            ]
            rows.append(data)
        total = context['entries'].aggregate(hours=Sum('hours'))['hours']
        rows.append(('', '', '', '', '', '', 'Total:', total))
        return rows


class InvoiceEdit(InvoiceDetail):
    template_name = 'timepiece/time-sheet/invoice/edit.html'

    def get_context_data(self, **kwargs):
        context = super(InvoiceEdit, self).get_context_data(**kwargs)
        invoice_form = timepiece_forms.InvoiceForm(instance=self.object)
        context.update({
            'invoice_form': invoice_form,
        })
        return context

    def post(self, request, **kwargs):
        invoice = get_object_or_404(timepiece.EntryGroup, pk=kwargs.get('pk'))
        self.object = invoice
        initial = {
            'project': invoice.project,
            'user': request.user,
            'from_date': invoice.start,
            'to_date': invoice.end,
        }
        invoice_form = timepiece_forms.InvoiceForm(request.POST,
                                                   initial=initial,
                                                   instance=invoice)
        if invoice_form.is_valid():
            invoice_form.save()
            return HttpResponseRedirect(reverse('view_invoice', kwargs=kwargs))
        else:
            context = super(InvoiceEdit, self).get_context_data(**kwargs)
            context.update({
                'invoice_form': invoice_form,
            })
            return self.render_to_response(context)


class InvoiceDelete(InvoiceDetail):
    template_name = 'timepiece/time-sheet/invoice/delete.html'

    def post(self, request, **kwargs):
        invoice = get_object_or_404(timepiece.EntryGroup, pk=kwargs.get('pk'))
        if 'delete' in request.POST:
            invoice.delete()
            return HttpResponseRedirect(reverse('list_invoices'))
        else:
            return redirect(reverse('edit_invoice', kwargs=kwargs))


@permission_required('timepiece.change_entrygroup')
@login_required
def remove_invoice_entry(request, invoice_id, entry_id):
    invoice = get_object_or_404(timepiece.EntryGroup, pk=invoice_id)
    entry = get_object_or_404(timepiece.Entry, pk=entry_id)
    if request.POST:
        entry.status = 'approved'
        entry.entry_group = None
        entry.save()
        kwargs = {'pk': invoice_id}
        return HttpResponseRedirect(reverse('edit_invoice', kwargs=kwargs))
    else:
        context = {
            'invoice': invoice,
            'entry': entry,
        }
        return render(request,
            'timepiece/time-sheet/invoice/remove_invoice_entry.html',
            context
        )


@permission_required('timepiece.view_business')
@render_with('timepiece/business/list.html')
@login_required
def list_businesses(request):
    form = timepiece_forms.SearchForm(request.GET)
    if form.is_valid() and 'search' in request.GET:
        search = form.cleaned_data['search']
        businesses = timepiece.Business.objects.filter(
            Q(name__icontains=search) |
            Q(description__icontains=search)
        )
        if businesses.count() == 1:
            url_kwargs = {
                'business': businesses[0].pk,
            }
            return HttpResponseRedirect(
                reverse('view_business', kwargs=url_kwargs)
            )
    else:
        businesses = timepiece.Business.objects.all()

    context = {
        'form': form,
        'businesses': businesses,
    }
    return context


@permission_required('timepiece.view_business')
@render_with('timepiece/business/view.html')
@login_required
def view_business(request, business):
    business = get_object_or_404(timepiece.Business, pk=business)
    context = {
        'business': business,
    }
    return context


@permission_required('timepiece.add_business')
@render_with('timepiece/business/create_edit.html')
@login_required
def create_edit_business(request, business=None):
    if business:
        business = get_object_or_404(timepiece.Business, pk=business)
    if request.POST:
        business_form = timepiece_forms.BusinessForm(
            request.POST,
            instance=business,
        )
        if business_form.is_valid():
            business = business_form.save(request.user.profile.impd_client)
            business.create_default_statuses()
            business.ensure_single_sprint(point_person=request.user)
            _set_project_rate_to_default_for_user(request.user, business.sprints.first())
            return HttpResponseRedirect(
                reverse('closed_project_list', kwargs={'business_id':business.id})
            )
    else:
        business_form = timepiece_forms.BusinessForm(
            instance=business
        )


    add_user_form = timepiece_forms.AddUserToBusinessForm()
    context = {
        'business': business,
        'business_form': business_form,
        'add_user_form': add_user_form
    }

    return context

@csrf_exempt
@permission_required('timepiece.add_business')
@login_required
def add_user_to_business(request, business_id):
    business = get_object_or_404(timepiece.Business, pk=business_id)
    if request.POST:
        form = timepiece_forms.AddUserToBusinessForm(request.POST)
        if form.is_valid():
            point_person = form.save()
            #timepiece.BusinessRelationship.objects.get_or_create(
            #    user=user,
            #    business=business,
            #)
    #import pdb; pdb.set_trace()
    #if 'next' in request.REQUEST and request.REQUEST['next']:
    #    return HttpResponseRedirect(request.REQUEST['next'])
    #else:
    #    return HttpResponseRedirect(
    #        reverse('view_business', args=(business.pk,)))

def _set_project_rate_to_default_for_user(user, project):
    profile = timepiece.UserProfile.objects.get_or_create(user=user)[0]
    if timepiece.Rate.objects.filter(user=user, project=project):
        rate = timepiece.Rate.objects.get(user=user, project=project)
    else:
        rate = timepiece.Rate.objects.create(user=user, project=project)
    if rate.amount == 0 and rate.billable_amount == 0:
        rate.amount = profile.amount
        rate.billable_amount = profile.billable_amount
        rate.save()


@permission_required('timepiece.can_manage_client_users')
@login_required
def list_people(request, template='timepiece/person/list.html'):
    d = request.GET.copy()
    if 'staff' not in d:
        d['staff'] = 'staff'
    form = timepiece_forms.UserSearchForm(d)
    people = auth_models.User.objects.all().order_by('username')

    if not request.user.is_superuser:
        people = people.filter(profile__impd_client_id=request.user.profile.impd_client_id)
    if not request.user.is_staff:
        people = people.filter(pk=request.user.id)

    if form.is_valid():
        if form.cleaned_data.get('search', None):
            search = form.cleaned_data['search']
            people = people.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)).order_by("username")
        if form.cleaned_data.get('staff', 'all') != 'all':
            people = people.filter( is_staff = (form.cleaned_data['staff'] == 'staff') )

    context = {
        'form': form,
        'people': people.select_related(),
    }
    return render(request, template, context)


@permission_required('timepiece.can_manage_client_users')
@render_with('timepiece/person/view.html')
@login_required
def view_person(request, person_id):
    person = get_object_or_404(auth_models.User, pk=person_id)

    if request.user.is_superuser:
        pass
    elif request.user.is_staff:
        if person.profile.impd_client_id != request.user.profile.impd_client_id:
            raise Exception("Can't edit this person")
    else:
        if person.profile.id != request.user.id:
            raise Exception("Can't edit this person")

    context = {
        'person': person,
    }
    try:
        from ledger.models import Exchange
        context['exchanges'] = Exchange.objects.filter(
            transactions__project=project,
        ).distinct().select_related().order_by('type', '-date', '-id',)
        context['show_delivered_column'] = \
            context['exchanges'].filter(type__deliverable=True).count() > 0
    except ImportError:
        pass

    return context

@permission_required('timepiece.can_manage_client_users')
@login_required
def edit_leave(request, person_id=None, template="timepiece/person/edit_leave.html"):
    context = {}
    if person_id:
        person = get_object_or_404(auth_models.User, pk=person_id)
    else:
        person = None

    if request.user.is_superuser:
        pass
    elif request.user.is_staff:
        if person.profile.impd_client_id != request.user.profile.impd_client_id:
            raise Exception("Can't edit this person")
    else:
        if person.profile.id != request.user.id:
            raise Exception("Can't edit this person")

    form = timepiece_forms.PersonLeaveForm(request.POST or None)
    if form.is_valid():
        timepiece.CalendarEvent.objects.get_or_create(start=form.cleaned_data['date'],
                                                      user=person,
                                                      event_type=form.cleaned_data['reason'],
                                                      status='CONFIRMED',
                                                      hours=8)[0]
        return HttpResponseRedirect(reverse('edit_leave', args=(person_id,)))

    context['existing_leaves'] = timepiece.CalendarEvent.objects.filter(user=person).order_by("-start")
    context['new_leave_form'] = form
    context['person'] = person
    return render(request, template, context)

@permission_required('timepiece.can_manage_client_users')
@login_required
def delete_leave(request, person_id, calendar_event_id):
    context = {}
    if person_id:
        person = get_object_or_404(auth_models.User, pk=person_id)
    else:
        person = None

    if request.user.is_superuser:
        pass
    elif request.user.is_staff:
        if person.profile.impd_client_id != request.user.profile.impd_client_id:
            raise Exception("Can't edit this person")
    else:
        if person.profile.id != request.user.id:
            raise Exception("Can't edit this person")

    calendar_event = timepiece.CalendarEvent.objects.get(pk=calendar_event_id)
    calendar_event.delete()
    return HttpResponseRedirect(reverse('edit_leave', args=(person_id,)))


@permission_required('timepiece.can_manage_client_users')
@login_required
def create_edit_person(request, person_id=None, template='timepiece/person/create_edit.html'):

    if person_id:
        person = get_object_or_404(auth_models.User, pk=person_id)
    else:
        person = None

    if request.user.is_superuser:
        pass
    elif request.user.is_staff:
        if person.profile.impd_client_id != request.user.profile.impd_client_id:
            raise Exception("Can't edit this person")

    if person_id:
        person = get_object_or_404(auth_models.User, pk=person_id)
    else:
        person = None

    if request.user.is_superuser:
        pass
    elif request.user.is_staff:
        if person.profile.impd_client_id != request.user.profile.impd_client_id:
            raise Exception("Can't edit this person")
    else:
        if person.profile.id != request.user.id:
            raise Exception("Can't edit this person")
        if person.profile.impd_client_id != request.user.profile.impd_client_id:
            raise Exception("Can't edit this person")

    if request.POST:
        if person:
            profile_form = timepiece_forms.UserProfileForm(creator=request.user, data=request.POST, instance=person.profile, prefix='profile')
            person_form = timepiece_forms.EditPersonForm(
                request.POST,
                instance=person,
            )
        else:
            person_form = timepiece_forms.CreatePersonForm(request.POST,)
            profile_form = timepiece_forms.UserProfileForm(creator=request.user, data=request.POST, prefix='profile')
        if person_form.is_valid() and profile_form.is_valid():
            person = person_form.save()
            profile = profile_form.save(request.user, person)

            return HttpResponseRedirect(reverse('view_person', args=(person.id,)))
    else:
        if person:
            profile = timepiece.UserProfile.objects.get_or_create(user=person)[0]
            profile_form = timepiece_forms.UserProfileForm(request.user, instance=profile, prefix='profile')
            person_form = timepiece_forms.EditPersonForm(instance=person)
        else:
            profile_form = timepiece_forms.UserProfileForm(request.user, prefix='profile')
            person_form = timepiece_forms.CreatePersonForm()

    context = {
        'person': person,
        'person_form': person_form,
        'profile_form': profile_form
    }
    return render(request, template, context)

@render_with('timepiece/project/detail.html')
@login_required
def project_detail(request, business_id):
    if request.GET:
        form = timepiece_forms.ProjectSearchForm(request.GET)
    else:
        form = timepiece_forms.ProjectSearchForm({'status': u'5'})

    projects = timepiece.Project.objects.filter(business__id=business_id)
    try:
        business = timepiece.Business.objects.get(pk = business_id)
    except timepiece.Business.DoesNotExist:
        raise PermissionDenied

    has_edit_project_detail = timepiece.BusinessPermissions.objects.get_or_create(business=business, user=request.user)[0].has_edit_project_detail
    if not has_edit_project_detail:
        raise PermissionDenied

    if form.is_valid():
        search, status = form.save()
        if status == 'any':
            status = ''
        projects = projects.filter(
            Q(name__icontains=search) | Q(description__icontains=search)).filter_by_logged_in_user(request.user)
        projects = projects.filter(status=status) if status else projects
    else:
        projects = timepiece.Project.objects.filter_by_logged_in_user(request.user).filter(status__label='open')

    context = {}
    from_date, to_date = _get_filter_dates_only(request, context)

    if request.GET:
        if from_date and to_date:
            projects = projects.filter(entries__start_time__range=(from_date, to_date)).distinct()
        elif from_date:
            projects = projects.filter(entries__start_time__gte=from_date).distinct()
        elif to_date:
            projects = projects.filter(entries__start_time__lte=to_date).distinct()
    else:
        projects = projects.distinct()

    projects = projects.annotate(end_time=Max('entries__end_time'), start_time=Min('entries__start_time'))

    total_outstanding_amount = 0
    total_outstanding_amounts_per_project = {}

    businesses = defaultdict(lambda: [])
    for project in projects:
        businesses[project.business].append(project)
    businesses = dict((b, _business_total(p, from_date, to_date)) for b, p in businesses.iteritems())
    user_totals = {}
    for b in businesses.values():
        _sum_user_totals(b['users_and_hours'], user_totals)

    last_active = {}

    entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user)
    for user in User.objects.all().distinct():
        last_active[user.username] = entries.filter(user=user).aggregate(end_time=Max('end_time'))['end_time']

    #print user_totals



    context.update({
        'current_user':request.user,
        'form': form,
        'expense_form': timepiece_forms.ExpenseForm(),
        'invoice_form': timepiece_forms.InvoiceForm(),
        'last_active': last_active,
        'businesses': sorted(businesses.iteritems()),
        'projects': projects.select_related('business'),
        'total_outstanding_amount':total_outstanding_amount,
        'total_outstanding_amounts_per_project':total_outstanding_amounts_per_project,
        'user_totals': user_totals
    })

    if 'selected_issue_ids_for_context_menu' in request.session:
        context['selected_issue_ids'] = [int(x) for x in request.session['selected_issue_ids_for_context_menu']]

    return context


@permission_required('timepiece.view_project')
@login_required
@render_with('timepiece/project/users_last_active.html')
def users_last_active(request, context=None):
    context = context or {}
    last_active = {}

    entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user)
    for user in User.objects.all().distinct():
        last_active[user.username] = entries.filter(user=user).aggregate(end_time=Max('end_time'))['end_time']
    context['last_active'] = last_active
    return context

@permission_required('timepiece.view_project')
@login_required
@render_with('timepiece/project/amounts_billed.html')
def amounts_billed(request):

    raise Exception("This page is too slow")

    if request.GET:
        form = timepiece_forms.ProjectSearchForm(request.GET)
    else:
        form = timepiece_forms.ProjectSearchForm({'status': u'5'})
    if form.is_valid():
        search, status = form.save()
        if status == 'any':
            status = ''
        projects = timepiece.Project.objects.filter(
            Q(name__icontains=search) | Q(description__icontains=search)).filter_by_logged_in_user(request.user)
        projects = projects.filter(status=status) if status else projects
    else:
        projects = timepiece.Project.objects.filter_by_logged_in_user(request.user).filter(status__label='open')

    context = {}
    from_date, to_date = _get_filter_dates_only(request, context)

    if request.GET:
        if from_date and to_date:
            projects = projects.filter(entries__start_time__range=(from_date, to_date)).distinct()
        elif from_date:
            projects = projects.filter(entries__start_time__gte=from_date).distinct()
        elif to_date:
            projects = projects.filter(entries__start_time__lte=to_date).distinct()
    else:
        projects = projects.distinct()

    projects = projects.annotate(end_time=Max('issues__entries__end_time'), start_time=Min('issues__entries__start_time'))

    total_outstanding_amount = 0
    total_outstanding_amounts_per_project = {}

    businesses = defaultdict(lambda: [])

    for project in projects:
        businesses[project.business.name].append(project)

    businesses = dict((b, _business_total(p, from_date, to_date)) for b, p in businesses.iteritems())
    user_totals = {}
    for b in businesses.values():
        _sum_user_totals(b['users_and_hours'], user_totals)

    last_active = {}

    entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user)
    for user in User.objects.all().distinct():
        last_active[user.username] = entries.filter(user=user).aggregate(end_time=Max('end_time'))['end_time']

    #print user_totals

    context.update({
        'form': form,
        'expense_form': timepiece_forms.ExpenseForm(),
        'invoice_form': timepiece_forms.InvoiceForm(),
        'last_active': last_active,
        'businesses': sorted(businesses.iteritems()),
        'projects': projects.select_related('business'),
        'total_outstanding_amount':total_outstanding_amount,
        'total_outstanding_amounts_per_project':total_outstanding_amounts_per_project,
        'user_totals': user_totals,
    })
    return context

@render_with('timepiece/project/list.html')
@login_required
def list_projects(request):

    last_active = {}
    entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user)
    for user in User.objects.all().distinct():
        last_active[user.username] = entries.filter(user=user).aggregate(end_time=Max('end_time'))['end_time']

    businesses = timepiece.Business.get_related_business_by_user(request.user).order_by("name")

    context = {'active_businesses': businesses.filter_has_any_active_projects(),
               'pending_businesses': businesses.filter_has_only_pending_projects(),
               'closed_businesses': businesses.filter_has_only_closed_projects(),
               'hopeful_businesses': businesses.filter_has_hopeful_projects(),
               'active_project_states': ", ".join(timepiece.Project.active_states()),
               'pending_project_states': ", ".join(timepiece.Project.pending_states()),
               'closed_project_states': ", ".join(timepiece.Project.closed_states()),
               'hopeful_project_states': ", ".join(timepiece.Project.hopeful_states()),
               'last_active': last_active,
               'current_user': request.user}
    return context

# @permission_required('timepiece.view_project')
# @render_with('timepiece/project/list_old.html')
# def list_projects(request):
#     if request.GET:
#         form = timepiece_forms.ProjectSearchForm(request.GET)
#     else:
#         form = timepiece_forms.ProjectSearchForm({'status': u'5'})
#     if form.is_valid():
#         search, status = form.save()
#         if status == 'any':
#             status = ''
#         projects = timepiece.Project.objects.filter(
#             Q(name__icontains=search) | Q(description__icontains=search)).filter_by_logged_in_user(request.user)
#         projects = projects.filter(status=status) if status else projects
#     else:
#         projects = timepiece.Project.objects.filter_by_logged_in_user(request.user).filter(status__label='open')

#     context = {}
#     from_date, to_date = _get_filter_dates_only(request, context)

#     if request.GET:
#         if from_date and to_date:
#             projects = projects.filter(entries__start_time__range=(from_date, to_date)).distinct()
#         elif from_date:
#             projects = projects.filter(entries__start_time__gte=from_date).distinct()
#         elif to_date:
#             projects = projects.filter(entries__start_time__lte=to_date).distinct()
#     else:
#         projects = projects.distinct()

#     projects = projects.annotate(end_time=Max('entries__end_time'), start_time=Min('entries__start_time'))

#     total_outstanding_amount = 0
#     total_outstanding_amounts_per_project = {}

#     businesses = defaultdict(lambda: [])

#     for project in projects:
#         businesses[project.business.name].append(project)

#     businesses = dict((b, _business_total(p, from_date, to_date)) for b, p in businesses.iteritems())
#     user_totals = {}
#     for b in businesses.values():
#         _sum_user_totals(b['users_and_hours'], user_totals)

#     last_active = {}

#     entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user)
#     for user in User.objects.all().distinct():
#         last_active[user.username] = entries.filter(user=user).aggregate(end_time=Max('end_time'))['end_time']

#     #print user_totals

#     context.update({
#         'form': form,
#         'expense_form': timepiece_forms.ExpenseForm(),
#         'invoice_form': timepiece_forms.InvoiceForm(),
#         'last_active': last_active,
#         'businesses': sorted(businesses.iteritems()),
#         'projects': projects.select_related('business'),
#         'total_outstanding_amount':total_outstanding_amount,
#         'total_outstanding_amounts_per_project':total_outstanding_amounts_per_project,
#         'user_totals': user_totals,
#     })
#     return context


def _sum_user_totals(users_and_hours, totals=None):
    if totals is None:
        totals = {}


    def add_total(key):
        if key in _business_totals:
            _business_totals[key] += project_totals[key]
        else:
            _business_totals[key] = project_totals[key]

    for project, users in users_and_hours:
        for username, project_totals in users['users'].iteritems():
            if username not in totals:
                totals[username] = {}

            user = totals[username]
            business = project.business.name

            if business not in user:
                totals[username][business] = {'totals': {}}

            if 'projects' not in user[business]:
                user[business]['projects'] = {}

            user[business]['projects'][project.name] = project_totals

            _business_totals = user[business]['totals']

            add_total('hours')
            add_total('revenue')
            add_total('billed')

            _business_totals['ctc_rate'] = float(_business_totals['revenue']) / (float(_business_totals['hours']) or 1)
            _business_totals['billed_rate'] = float(_business_totals['billed'])  / (float(_business_totals['hours']) or 1)
    return totals

def _business_total(projects, start_time=None, end_time=None):
    entry_filter = [('start_time__gte', start_time), ('end_time__lte', end_time)]
    entry_filter = dict((k,v) for k,v in entry_filter if v)
    billed = 0
    ctc = 0
    ctc_rate = 0
    profit = 0
    billed_rate = 0
    hours = 0
    users_and_hours = {}
    expenses = 0
    invoices = 0
    expense_objects = timepiece.Expense.objects.all()
    invoice_objects = Invoice.objects.all()
    business_id = None

    for project in projects:
        business_id = project.business.id
        users_and_hours[project] = project.users_and_hours(**entry_filter)
        totals = users_and_hours[project]['totals']
        billed += totals['billed']
        billed_rate += totals['billed_rate']
        profit += totals['profit']
        ctc_rate += totals['ctc_rate']
        ctc += totals['revenue']
        hours += float(totals['hours'])
        expense = expense_objects.filter(project=project).aggregate(amount=Sum('amount'))
        expense_amount = expense['amount']  if expense and expense['amount'] else 0

        invoice = invoice_objects.filter(project=project).aggregate(amount=Sum('items__total_cost'))
        invoice_amount = invoice['amount']  if invoice and invoice['amount'] else 0

        users_and_hours[project]['totals']['expenses'] = expense_amount
        users_and_hours[project]['totals']['invoices'] = invoice_amount
        expenses += expense_amount
        invoices += invoice_amount

    return {'business_id': business_id,
            'ctc_rate': ctc / hours if hours > 0 else 0,
            'ctc': ctc ,
            'billed_rate': billed / hours if hours > 0 else 0,
            'billed': billed,
            'profit': profit,
            'projects': projects,
            'hours': hours,
            'users_and_hours': sorted(users_and_hours.iteritems(), key=lambda p: -time.mktime(p[0].end_time.timetuple()) if p[0].end_time is not None else 0),
            'expenses': expenses,
            'invoices': invoices,
            }

@render_with('timepiece/project/view.html')
@login_required
def view_project(request, project_id):
    project = get_object_or_404(timepiece.Project, pk=project_id)

    has_edit_project_detail = timepiece.BusinessPermissions.objects.get_or_create(business=project.business, user=request.user)[0].has_edit_project_detail
    if not has_edit_project_detail:
        raise PermissionDenied

    add_user_form = timepiece_forms.AddUserToProjectForm()
    context = {
        'project': project,
        'add_user_form': add_user_form,
    }
    try:
        from ledger.models import Exchange
        context['exchanges'] = Exchange.objects.filter(
            transactions__project=project,
        ).distinct().select_related().order_by('type', '-date', '-id',)
        context['show_delivered_column'] = \
            context['exchanges'].filter(type__deliverable=True).count() > 0
    except ImportError:
        pass

    return context


@csrf_exempt
@permission_required('timepiece.change_project')
@login_required
def add_user_to_project(request, project_id):
    project = get_object_or_404(timepiece.Project, pk=project_id)
    if request.POST:
        form = timepiece_forms.AddUserToProjectForm(request.POST)
        if form.is_valid():
            user = form.save()
            # timepiece.ProjectRelationship.objects.get_or_create(
            #     user=user,
            #     project=project,
            # )
            bp = timepiece.BusinessPermissions.objects.get_or_create(business_id=project.business_id, user=user)[0]
            bp.is_active_member_of_business = True
            bp.save()
            _set_project_rate_to_default_for_user(user, project)
    return HttpResponseRedirect(
        reverse('view_project', args=(project.pk,)))


@csrf_exempt
@permission_required('timepiece.change_project')
@login_required
def remove_user_from_project(request, project_id, user_id):
    project = get_object_or_404(timepiece.Project, pk=project_id)
    try:
        rel = timepiece.ProjectRelationship.objects.get(
            user=user_id,
            project=project,
        )
    except timepiece.ProjectRelationship.DoesNotExist:
        pass
    else:
        rel.delete()
    return HttpResponseRedirect(
        reverse('view_project', args=(project.pk,)))


@permission_required('timepiece.change_project')
@render_with('timepiece/project/relationship.html')
@login_required
def edit_project_relationship(request, project_id, user_id):
    project = get_object_or_404(timepiece.Project, pk=project_id)
    try:
        rel = project.project_relationships.get(user__pk=user_id)
    except timepiece.ProjectRelationship.DoesNotExist:
        raise Http404
    rel = timepiece.ProjectRelationship.objects.get(
        project=project,
        user=rel.user,
    )
    if request.POST:
        relationship_form = timepiece_forms.ProjectRelationshipForm(
            request.POST,
            instance=rel,
        )
        if relationship_form.is_valid():
            rel = relationship_form.save()
            return HttpResponseRedirect(request.REQUEST['next'])
    else:
        relationship_form = \
            timepiece_forms.ProjectRelationshipForm(instance=rel)

    context = {
        'user': rel.user,
        'project': project,
        'relationship_form': relationship_form,
    }
    return context

@permission_required('timepiece.add_project')
@permission_required('timepiece.change_project')
@login_required
@csrf_exempt
def create_close_project(request, project_id=None):
    project = get_object_or_404(timepiece.Project, pk=project_id)
    project.close();
    return HttpResponse("ok");

@permission_required('timepiece.add_project')
@permission_required('timepiece.change_project')
@login_required
@csrf_exempt
def create_open_project(request, project_id=None):
    project = get_object_or_404(timepiece.Project, pk=project_id)
    project.open();
    return HttpResponse("ok");

@permission_required('timepiece.add_project')
@permission_required('timepiece.invoiced_project')
@login_required
def invoiced_project(request, project_id=None):
    project = get_object_or_404(timepiece.Project, pk=project_id)
    project.status3 = timepiece.ProjectStatus.objects\
                                             .get_or_create(name='closed',
                                                            business=project.business)[0]
    project.billable = True
    project.save()
    timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(issue__project=project).update(status='invoiced')
    return HttpResponseRedirect(reverse('list_projects'))

@permission_required('timepiece.add_project')
@permission_required('timepiece.unbillable_project')
@login_required
def unbillable_project(request, project_id=None):
    project = get_object_or_404(timepiece.Project, pk=project_id)
    project.status3 = timepiece.ProjectStatus.objects\
                                             .get_or_create(name='closed',
                                                            business=project.business)[0]
    project.billable = False
    project.save()
    timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(issue__project=project).update(status='invoiced')
    return HttpResponseRedirect(reverse('list_projects'))



@login_required
def update_project(request, project_id=None, template='timepiece/project/edit.html'):

    if project_id is None:
        template = 'timepiece/project/create.html'
        project = None
    else:
        project = get_object_or_404(timepiece.Project, pk=project_id)

    bp = timepiece.BusinessPermissions.for_user(request.user, project.business)
    if bp.has_edit_project_detail:
        form = timepiece_forms.ProjectForm(bp=bp, data=request.POST or None, instance=project)
        if request.POST and form.is_valid():
            project = form.save()
            project.save()
            return HttpResponseRedirect(
                reverse('edit_project', args=(project.id,))
                )

    context = {
        'project': project,
        'business': project.business,
        'project_form': form,
    }

    return render(request, template, context)

@permission_required('timepiece.add_project')
@render_with('timepiece/project/create_edit.html')
@login_required
def create_project(request):

    business_id = request.GET['business_id']
    business = timepiece.Business.objects.get(pk=business_id)
    project = timepiece.Project(  business = business,
                                  point_person = request.user,
                                  type = timepiece.Attribute.objects.get(label="default"),
                                  status = timepiece.Attribute.objects.get(label="open"),
                                  )


    form = timepiece_forms.NewProjectForm(request.POST or None, instance=project)
    if form.is_valid():
        project = form.save()
        project.save()
        timepiece.BusinessProjectOrder.insert_at_the_end(project)
        return HttpResponseRedirect(reverse('view_project', args=(project.id,)))

    context = {
        'business':business,
        'project': project,
        'project_form': form,
    }
    return context


@render_with('timepiece/project/edit_project_budget.html')
@login_required
def edit_project_budget(request, project_id=None):
    project = get_object_or_404(timepiece.Project, pk=project_id) \
        if project_id else None

    has_edit_budget = timepiece.BusinessPermissions.objects.get_or_create(business=project.business, user=request.user)[0].has_edit_budget
    if not has_edit_budget:
        raise PermissionDenied

    form = timepiece_forms.ProjectBudgetForm(request.POST or None, instance=project)
    if request.POST and form.is_valid():
        project = form.save()
        project.save()
        return HttpResponse("done")

    context = {
        'project': project,
        'project_form': form,
        'business': project.business,
        'current_business': project.business,
        'current_user': request.user,
    }
    return context

@render_with('timepiece/project/edit_project_deadlines.html')
@login_required
def edit_project_deadlines(request, project_id=None):
    project = get_object_or_404(timepiece.Project, pk=project_id) \
        if project_id else None

    has_edit_deadlines = timepiece.BusinessPermissions.objects.get_or_create(business=project.business, user=request.user)[0].has_edit_deadlines
    if not has_edit_deadlines:
        raise PermissionDenied

    form = timepiece_forms.ProjectDeadlineForm(request.POST or None, instance=project)
    if request.POST and form.is_valid():
        project = form.save()
        project.save()
        return HttpResponse("done")

    context = {
        'project': project,
        'project_form': form,
        'business': project.business,
        'current_business': project.business,
        'current_user': request.user,
    }
    return context


@permission_required('timepiece.view_payroll_summary')
@render_with('timepiece/time-sheet/reports/summary.html')
@login_required
def payroll_summary(request):
    date = timezone.now() - relativedelta(months=1)
    from_date = utils.get_month_start(date).date()
    to_date = from_date + relativedelta(months=1)

    year_month_form = timepiece_forms.YearMonthForm(request.GET or None, initial={
        'month': from_date.month,
        'year': from_date.year
    })

    if year_month_form.is_valid():
        from_date, to_date = year_month_form.save()
    last_billable = utils.get_last_billable_day(from_date)
    projects = getattr(settings, 'TIMEPIECE_PROJECTS', {})
    weekQ = Q(end_time__gt=utils.get_week_start(from_date),
              end_time__lt=last_billable + datetime.timedelta(days=1))
    monthQ = Q(end_time__gt=from_date, end_time__lt=to_date)
    workQ = ~Q(project__in=projects.values())
    statusQ = Q(status='invoiced') | Q(status='approved')
    # Weekly totals
    week_entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).date_trunc('week')
    week_entries = week_entries.filter(weekQ, statusQ, workQ)
    date_headers = utils.generate_dates(from_date, last_billable, by='week')
    weekly_totals = list(utils.project_totals(week_entries, date_headers,
                                              'total', overtime=True))
    # Monthly totals
    leave = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(monthQ, ~workQ
                                  ).values('user', 'hours', 'project__name')
    extra_values = ('project__type__label',)
    month_entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).date_trunc('month', extra_values)
    month_entries_valid = month_entries.filter(monthQ, statusQ, workQ)
    labels, monthly_totals = utils.payroll_totals(month_entries_valid, leave)
    # Unapproved and unverified hours
    entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(monthQ)
    user_values = ['user__pk', 'user__first_name', 'user__last_name']
    unverified = entries.filter(monthQ, status='unverified',
                                user__is_active=True)
    unapproved = entries.filter(monthQ, status='verified')
    return {
        'from_date': from_date,
        'year_month_form': year_month_form,
        'date_headers': date_headers,
        'weekly_totals': weekly_totals,
        'monthly_totals': monthly_totals,
        'unverified': unverified.values_list(*user_values).distinct(),
        'unapproved': unapproved.values_list(*user_values).distinct(),
        'labels': labels,
    }


@permission_required('timepiece.view_projection_summary')
@render_with('timepiece/time-sheet/projection/projection.html')
@utils.date_filter
@login_required
def projection_summary(request, form, from_date, to_date, status, activity):
    if not (from_date and to_date):
        today = datetime.date.today()
        from_date = today.replace(day=1)
        to_date = from_date + relativedelta(months=1)
    contracts = timepiece.ProjectContract.objects.exclude(status='complete')
    contracts = contracts.exclude(
        project__in=settings.TIMEPIECE_PROJECTS.values())
    contracts = contracts.order_by('end_date')
    users = User.objects.filter(assignments__contract__in=contracts).distinct()
    weeks = utils.generate_dates(start=from_date, end=to_date, by='week')

    return {
        'form': form,
        'weeks': weeks,
        'contracts': contracts.select_related(),
        'users': users,
    }


@login_required
@render_with('timepiece/person/settings.html')
def edit_settings(request):
    next_url = None
    if request.GET and 'next' in request.GET:
        next_url = request.GET['next']
        try:
            view_info = resolve(next_url)
        except Http404:
            next_url = None
    if not next_url:
        next_url = reverse('timepiece-entries')
    profile, created = timepiece.UserProfile.objects.get_or_create(
        user=request.user)
    if request.POST:
        user_form = timepiece_forms.UserForm(
            request.POST, instance=request.user)
        profile_form = timepiece_forms.UserProfileForm(request.user,
            request.POST, instance=profile)
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save(request.user)
            messages.info(request, 'Your settings have been updated')
            return HttpResponseRedirect(next_url)
    else:
        profile_form = timepiece_forms.UserProfileForm(creator=request.user, instance=profile)
        user_form = timepiece_forms.UserForm(instance=request.user)
    return {'profile_form': profile_form, 'user_form': user_form}


class ContractDetail(DetailView):
    template_name = 'timepiece/time-sheet/contract/view.html'
    model = timepiece.ProjectContract
    context_object_name = 'contract'

    @method_decorator(permission_required('timepiece.add_project_contract'))
    def dispatch(self, *args, **kwargs):
        return super(ContractDetail, self).dispatch(*args, **kwargs)


class ContractList(ListView):
    template_name = 'timepiece/time-sheet/contract/list.html'
    model = timepiece.ProjectContract
    context_object_name = 'contracts'
    queryset = timepiece.ProjectContract.objects.filter(
        status='current'
    ).select_related(
        'project'
    ).order_by(
        'project__name'
    )

    @method_decorator(permission_required('timepiece.add_project_contract'))
    def dispatch(self, *args, **kwargs):
        return super(ContractList, self).dispatch(*args, **kwargs)


class DeleteView(TemplateView):
    model = None
    url_name = None
    permissions = None
    form_class = timepiece_forms.DeleteForm
    template_name = 'timepiece/delete_object.html'

    def dispatch(self, request, *args, **kwargs):
        for permission in self.permissions:
            if not request.user.has_perm(permission):
                messages.info(request, 'You do not have permission to access that')
                return HttpResponseRedirect(reverse_lazy('timepiece-entries'))
        return super(DeleteView, self).dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        instance = self.get_queryset(**kwargs)
        form = self.form_class(request.POST, instance=instance)
        msg = '{0} could not be successfully deleted'.format(instance)

        if form.is_valid():
            if form.save():
                msg = '{0} was successfully deleted'.format(instance)

        messages.info(request, msg)
        return HttpResponseRedirect(reverse_lazy(self.url_name))

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(*args, **kwargs)
        return self.render_to_response(context)

    def get_queryset(self, **kwargs):
        pk = kwargs.get('pk', None)
        return get_object_or_404(self.model, pk=pk)

    def get_context_data(self, *args, **kwargs):
        context = super(DeleteView, self).get_context_data(*args, **kwargs)
        context['object'] = self.get_queryset(**kwargs)
        return context


class DeletePersonView(DeleteView):
    model = User
    url_name = 'list_people'
    permissions = ('auth.add_user', 'auth.change_user',)


class DeleteBusinessView(DeleteView):
    model = timepiece.Business
    url_name = 'list_businesses'
    permissions = ('timepiece.add_business',)


class DeleteProjectView(DeleteView):
    model = timepiece.Project
    url_name = 'list_projects'
    permissions = ('timepiece.add_project', 'timepiece.change_project',)


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


class ReportMixin(object):
    @method_decorator(permission_required('timepiece.view_entry_summary'))
    def dispatch(self, request, *args, **kwargs):
        return super(ReportMixin, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        super(ReportMixin, self).get_context_data(**kwargs)
        user = self.request.user
        context = super(ReportMixin, self).get_context_data(**kwargs)

        end = utils.get_month_start(timezone.now())
        from_date, to_date = utils.process_dates(self.request.GET,
            end - relativedelta(months=1), end)

        date_form = timepiece_forms.DateForm({
            'from_date': from_date,
            'to_date': to_date,
        })

        header_to = to_date - relativedelta(days=1)
        trunc = timepiece_forms.ProjectFiltersForm.DEFAULT_TRUNC
        query = Q(end_time__gt=utils.get_week_start(from_date),
                  end_time__lt=to_date)

        project_form = timepiece_forms.ProjectFiltersForm(self.request.GET)

        if project_form.is_valid():
            trunc = project_form.cleaned_data['trunc']
            if not project_form.cleaned_data['paid_leave']:
                projects = getattr(settings, 'TIMEPIECE_PROJECTS', {})
                query &= ~Q(project__in=projects.values())
            if project_form.cleaned_data['pj_select']:
                query &= Q(project__in=project_form.cleaned_data['pj_select'])

        entries = timepiece.Entry.objects.filter_by_logged_in_user(user).date_trunc(trunc,
            extra_values=('activity', 'issue__project__status2__name')).filter(query)
        date_headers = utils.generate_dates(from_date, header_to, by=trunc)

        context.update({
            'date_form': date_form,
            'from_date': from_date,
            'to_date': to_date,
            'date_headers': date_headers,
            'trunc': trunc,
            'entries': entries,
            'pj_filters': project_form
        })
        return context


class HourlyReport(ReportMixin, CSVMixin, TemplateView):
    template_name = 'timepiece/time-sheet/reports/hourly.html'

    def get(self, request, *args, **kwargs):
        export = request.GET.get('export', False)
        context = self.get_context_data()

        kls = CSVMixin if export else TemplateView
        return kls.render_to_response(self, context)

    def get_filename(self, context):
        request = self.request.GET.copy()
        from_date = request.get('from_date')
        to_date = request.get('to_date')
        return 'hours_{0}_to_{1}_by_{2}.csv'.format(from_date, to_date,
            context['trunc'])

    def convert_context_to_csv(self, context):
        "Convert the context dictionary into a CSV file"
        content = []
        date_headers = context['date_headers']

        headers = ['Name']
        headers.extend([date.strftime('%d/%m/%Y') for date in date_headers])
        headers.append('Total')
        content.append(headers)

        for rows, totals in context['project_totals']:
            for name, hours in rows:
                data = [name]
                data.extend(hours)
                content.append(data)
            total = ['Totals']
            total.extend(totals)
            content.append(total)

        return content

    def get_context_data(self, **kwargs):
        context = super(HourlyReport, self).get_context_data(**kwargs)
        entries = context['entries']
        date_headers = context['date_headers']
        hour_type = context['pj_filters'].get_hour_type()

        project_totals = utils.project_totals(entries, date_headers, hour_type,
            total_column=True) if entries else ''

        context.update({
            'project_totals': project_totals,
        })

        return context


class BillableHours(ReportMixin, TemplateView):
    template_name = 'timepiece/time-sheet/reports/billable_hours.html'

    def get_hours_data(self, data, entries, date_headers):
        users = data.get('people', '') or entries.order_by('user') \
            .values_list('user', flat=True)

        activities = data.get('activities', '') or \
            timepiece.Activity.objects.values_list('pk', flat=True)

        types = data.get('project_types', '') or \
            timepiece.Attribute.objects.values_list('pk', flat=True)

        filtered_entries = entries.filter(user__in=users,
            activity__in=activities, project__status__in=types)

        project_data = utils.project_totals(filtered_entries, date_headers,
            total_column=False)

        hours_data = {}
        dates = []

        for rows, totals in project_data:
            for user, hours in rows:
                hours_data[user] = []

                for hour in hours:
                    date = hour['day'].strftime('%d/%m/%Y')
                    if date not in dates:
                        dates.append(date)

                    hours_data.get(user, []).append({
                        'date': date,
                        'billable': hour['billable'],
                        'nonbillable': hour['nonbillable'],
                        'total': hour['total'],
                    })

        return dates, hours_data

    def get_context_data(self, **kwargs):
        context = super(BillableHours, self).get_context_data(**kwargs)
        entries = context['entries']
        date_headers = context['date_headers']
        people = []

        for e in entries:
            name = ' '.join([e['user__first_name'], e['user__last_name']])
            person = (e['user'], name,)
            if person not in people:
                people.append(person)

        form = timepiece_forms.BillableHoursForm(self.request.GET or None,
            choices={'people': people})

        form_data = form.save() if form.is_valid() else {}
        dates, hours_data = self.get_hours_data(form_data, entries,
            date_headers)

        context.update({
            'billable_form': form,
            'data': json.dumps(hours_data, cls=DecimalEncoder),
            'dates': json.dumps(dates),
        })

        return context


class ProjectHoursMixin(object):
    permissions = None

    def dispatch(self, request, *args, **kwargs):
        for perm in self.permissions:
            if not request.user.has_perm(perm):
                return HttpResponseRedirect(reverse('auth_login'))

        # Since we use get param in multiple places, attach it to the class
        default_week = utils.get_week_start(datetime.date.today()).date()

        if request.method == 'GET':
            week_start_str = request.GET.get('week_start', '')
        else:
            week_start_str = request.POST.get('week_start', '')

        # Account for an empty string
        self.week_start = default_week if week_start_str == '' \
            else utils.get_week_start(datetime.datetime.strptime(week_start_str,
                '%Y-%m-%d').date())

        return super(ProjectHoursMixin, self).dispatch(request, *args,
            **kwargs)

    def get_hours_for_week(self, start=None):
        week_start = start if start else self.week_start
        week_end = week_start + relativedelta(days=7)

        return timepiece.ProjectHours.objects.filter(week_start__gte=week_start,
            week_start__lt=week_end)


# class ProjectHoursView(ProjectHoursMixin, TemplateView):
#     template_name = 'timepiece/hours/list.html'
#     permissions = ('timepiece.can_clock_in',)

#     def get_context_data(self, **kwargs):
#         context = super(ProjectHoursView, self).get_context_data(**kwargs)

#         form = timepiece_forms.ProjectHoursSearchForm(initial={
#             'week_start': self.week_start
#         })

#         project_hours = utils.get_project_hours_for_week(self.week_start) \
#             .filter(published=True)
#         people = utils.get_people_from_project_hours(project_hours)
#         id_list = [person[0] for person in people]
#         projects = []

#         for project, entries in groupby(project_hours, lambda o: o['project__id']):
#             entries = list(entries)
#             proj_id = entries[0]['project__id']
#             name = entries[0]['project__name']
#             row = [None for i in range(len(id_list))]
#             for entry in entries:
#                 index = id_list.index(entry['user__id'])
#                 hours = entry['hours']
#                 row[index] = row[index] + hours if row[index] else hours
#             projects.append((proj_id, name, row))

#         context.update({
#             'form': form,
#             'week': self.week_start,
#             'prev_week': self.week_start - relativedelta(days=7),
#             'next_week': self.week_start + relativedelta(days=7),
#             'people': people,
#             'project_hours': project_hours,
#             'projects': projects
#         })

#         return context


class EditProjectHoursView(ProjectHoursMixin, TemplateView):
    template_name = 'timepiece/hours/edit.html'
    permissions = ('timepiece.add_projecthours',)

    def get_context_data(self, **kwargs):
        context = super(EditProjectHoursView, self).get_context_data(**kwargs)

        form = timepiece_forms.ProjectHoursSearchForm(initial={
            'week_start': self.week_start
        })

        context.update({
            'form': form,
            'week': self.week_start,
            'ajax_url': reverse('project_hours_ajax_view')
        })
        return context

    def post(self, request, *args, **kwargs):
        ph = self.get_hours_for_week(self.week_start).filter(published=False)

        if ph.exists():
            ph.update(published=True)
            msg = 'Unpublished project hours are now published'
        else:
            msg = 'There were no hours to publish'

        messages.info(request, msg)

        param = {
            'week_start': self.week_start.strftime('%Y-%m-%d')
        }
        url = '?'.join((reverse('edit_project_hours'),
            urllib.urlencode(param),))

        return HttpResponseRedirect(url)


class ProjectHoursAjaxView(ProjectHoursMixin, View):
    permissions = ('timepiece.add_projecthours',)

    def get_instance(self, data, week_start):
        try:
            user = auth_models.User.objects.get(pk=data.get('user', None))
            project = timepiece.Project.objects.get(pk=data.get('project', None))
            hours = data.get('hours', None)
            week = datetime.datetime.strptime(week_start, '%Y-%m-%d').date()

            ph = timepiece.ProjectHours.objects.get(user=user, project=project,
                week_start=week)
            ph.hours = Decimal(hours)
        except (exceptions.ObjectDoesNotExist):
            ph = None

        return ph

    def get(self, request, *args, **kwargs):
        """
        Returns the data as a JSON object made up of the following key/value
        pairs:
            project_hours: the current project hours for the week
            projects: the projects that have hours for the week
            all_projects: all of the projects; used for autocomplete
            all_users: all users that can clock in; used for completion
        """
        perm = auth_models.Permission.objects.filter(
            content_type=ContentType.objects.get_for_model(timepiece.Entry),
            codename='can_clock_in'
        )
        project_hours = self.get_hours_for_week().values(
            'id', 'user', 'user__first_name', 'user__last_name',
            'project', 'hours', 'published'
        ).order_by('-project__type__billable', 'project__name',
            'user__first_name', 'user__last_name')
        inner_qs = project_hours.values_list('project', flat=True)
        projects = timepiece.Project.objects.filter_by_logged_in_user(request.user).filter(pk__in=inner_qs).values() \
            .order_by('name')
        if not request.user.is_superuser:
            projects = projects.filter(users=User.objects.get(pk=request.user.id))
        all_projects = timepiece.Project.objects.values('id', 'name')
        all_users = auth_models.User.objects.filter(groups__permissions=perm) \
            .values('id', 'first_name', 'last_name')

        data = {
            'project_hours': list(project_hours),
            'projects': list(projects),
            'all_projects': list(all_projects),
            'all_users': list(all_users),
            'ajax_url': reverse('project_hours_ajax_view'),
        }
        return HttpResponse(json.dumps(data, cls=DecimalEncoder), content_type='application/json')

    def duplicate_entries(self, duplicate, week_update):
        def duplicate_builder(queryset):
            for instance in queryset:
                duplicate = deepcopy(instance)
                duplicate.id = None
                duplicate.published = False
                duplicate.week_start += datetime.timedelta(days=7)
                yield duplicate

        def duplicate_helper():
            try:
                try:
                    bulk_create = getattr(timepiece.ProjectHours.objects,
                        'bulk_create')
                    bulk_create(duplicate_builder(prev_week_qs))
                except AttributeError:
                    for entry in duplicate_builder(prev_week_qs):
                        entry.save()
            except DatabaseError:
                msg = 'An error occurred and hours could not be duplicated'
                messages.error(self.request, msg)
            else:
                msg = 'Project hours were copied'
                messages.info(self.request, msg)

        date = datetime.datetime.strptime(week_update, '%Y-%m-%d').date()
        prev_week = date - relativedelta(days=7)
        prev_week_qs = self.get_hours_for_week(prev_week)
        week_qs = self.get_hours_for_week(date)

        param = {
            'week_start': week_update
        }
        url = '?'.join((reverse('edit_project_hours'),
            urllib.urlencode(param),))

        if week_qs.exists():
            inner_qs = week_qs.filter(project__in=prev_week_qs.values_list('project'),
                user__in=prev_week_qs.values_list('user'))

            if inner_qs.exists():
                for ph in inner_qs:
                    prev_ph = prev_week_qs.get(project=ph.project,
                        user=ph.user)
                    ph.hours = prev_ph.hours
                    ph.published = False
                    ph.save()
                msg = 'Project hours were copied'
                messages.info(self.request, msg)
            else:
                duplicate_helper()
        elif not prev_week_qs.exists():
            msg = 'There are no hours to copy'
            messages.warning(self.request, msg)
        else:
            duplicate_helper()

        return HttpResponseRedirect(url)

    def update_week(self, week_start):
        try:
            instance = self.get_instance(self.request.POST, week_start)
        except TypeError:
            msg = 'Parameter week_start must be a date in the format ' \
                'yyyy-mm-dd'
            return HttpResponse(msg, status=500)

        form = timepiece_forms.ProjectHoursForm(self.request.POST,
            instance=instance)

        if form.is_valid():
            ph = form.save()
            return HttpResponse(str(ph.pk), content_type='text/plain')

        msg = 'The request must contain values for user, project, and hours'
        return HttpResponse(msg, status=500)

    def post(self, request, *args, **kwargs):
        """
        Create or update an hour entry for a particular use and project. This
        function expects the following values:
            user: the user pk for the hours
            project: the project pk for the hours
            hours: the actual hours to store
            week_start: the start of the week for the hours

        If the duplicate key is present along with week_update, then items
        will be duplicated from week_update to the current week
        """
        duplicate = request.POST.get('duplicate', None)
        week_update = request.POST.get('week_update', None)
        week_start = request.POST.get('week_start', None)

        if duplicate and week_update:
            return self.duplicate_entries(duplicate, week_update)

        return self.update_week(week_start)


class ProjectHoursDetailView(ProjectHoursMixin, View):
    permissions = ('timepiece.add_projecthours',)

    def delete(self, request, *args, **kwargs):
        """
        Remove a project from the database
        """
        pk = kwargs.get('pk', None)

        if pk:
            try:
                ph = timepiece.ProjectHours.objects.get(pk=pk)
            except timepiece.ProjectHours.DoesNotExist:
                pass
            else:
                ph.delete()
                return HttpResponse('ok', content_type='text/plain')

        return HttpResponse('', status=500)

class SalaryView(TemplateView):
    template_name = 'timepiece/salary/index.html'
    permissions = ('timepiece.salaries',)

    def get_context_data(self, **kwargs):
        context = super(SalaryView, self).get_context_data(**kwargs)
        context.update({
                'users': User.objects.all()
                })
        return context

@permission_required('timepiece.can_change_salary')
@login_required
def salary_edit(request, user_id, template="timepiece/salary/payslip.html", context=None):
    context = context or {}
    user = User.objects.get(pk=user_id)
    context.update( {'user':user} )

    date = timezone.now() - relativedelta(months=1)
    from_date = utils.get_month_start(date).date()
    date_form = timepiece_forms.YearMonthForm(request.GET or None,
                                              initial={'month': from_date.month, 'year': from_date.year},
                                              prefix='date_form')
    if date_form.is_valid():
        from_date, dummy = date_form.save()
    context['date_form'] = date_form

    context['msg'] = ''
    try:
        salary = timepiece.Salary.objects.get(user=user, date__year=from_date.year, date__month=from_date.month)
    except timepiece.Salary.DoesNotExist:
        if request.POST:
            try:
                salary = timepiece.Salary.objects.create(user=user, date=from_date)
                previous_salary = salary.copy_from_previous()
                context['msg'] = '(copied from %s)' % previous_salary.date.strftime('%b%Y')
            except IndexError:
                salary = timepiece.Salary.objects.create(user=user, date=from_date)
                context['msg'] = '(created new blank salary)'
        else:
            salary = timepiece.Salary.objects.create(user=user,date=from_date)
    was_locked = False #salary.locked

    if request.POST and 'copy_from_previous' in request.POST:
        salary.copy_from_previous()
        salary_form = timepiece_forms.SalaryForm(instance=salary)
    else:
        salary_form = timepiece_forms.SalaryForm(request.POST or None, instance=salary)

    user_form = timepiece_forms.QuickEditPersonForm(request.POST or None, instance=salary.user, prefix="user_form")

    if request.POST and was_locked:
        messages.error(request, "Save failed, the payslip is locked")
        return HttpResponseRedirect(reverse('salary_edit', kwargs={'user_id':salary.user.id}))

    if request.POST and user_form.is_valid() and salary_form.is_valid():
        salary_form.save()
        user_form.save()
        user_form = timepiece_forms.QuickEditPersonForm(request.POST or None, instance=salary.user, prefix="user_form")
        salary_form = timepiece_forms.SalaryForm(request.POST or None, instance=salary)

    context['user_form'] = user_form
    context['salary_form'] = salary_form
    context['salary'] = salary
    if salary:
        context['ytd'] = salary.ytd()
        context['leave'] = salary.leave_summary
    return render(request, template, context)

@permission_required('timepiece.can_change_salary')
@login_required
def salary_payslip(request, salary_id, preview=True, template="timepiece/salary/payslip_pdf.html", context=None):
    context = context or {}
    salary = timepiece.Salary.objects.get(pk=salary_id)
    user = salary.user
    context.update( {'salary':salary, 'user':user} )

    preview = preview == True or str(preview) == '1'

    context['ytd'] = salary.ytd()
    context['leave'] = salary.leave_summary
    context['preview'] = preview
    response = render(request, template, context)
    if not preview:
        html = response.content
        response = HttpResponse(render_to_pdf(html), content_type='application/pdf')
        filename = "payslip_%s_%s.pdf" % (salary.user.username, salary.date.strftime("%b%Y"))
        response['Content-Disposition'] = 'attachment; filename="%s"' % filename

    return response

@permission_required('timepiece.view_entry_summary')
@login_required
def incremental_timesheets_by_project(request, template="timepiece/time-sheet/redmine/incremental_timesheets_by_project.html", context=None):
    context = context or {}
    form = timepiece_forms.AggregatedTimesheetFormByProject(request.user, request.GET or None)
    if form.is_valid():
        report_args = form.save()
        report = report_helper.incremental_timesheets_by_project(**report_args)
        context['report'] = report
        csv_report = report_helper.convert_report_to_csv(report)
        response = HttpResponse(csv_report, content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="%s.csv"'%report_args['project'].name
        return response

    context['form'] = form
    return render(request, template, context)

@csrf_exempt
@permission_required('timepiece.change_project')
@login_required
def set_project_rate(request, context=None):
    project_id = request.POST['project_id']
    user_name = request.POST['user_name']
    new_amount = float(request.POST['amount'])
    new_billable_amount = float(request.POST['billable_amount'])

    project = timepiece.Project.objects.get(pk=project_id)
    rate = project.get_user_rate(user_name)
    rate.amount = str(new_amount)
    rate.billable_amount = str(new_billable_amount)
    rate.save()
    return HttpResponse("")

@permission_required('timepiece.view_entry_summary')
@login_required
def revenue(request, template="timepiece/time-sheet/reports/revenue.html", context=None):
    context = context or {}

    from_date, to_date = _get_filter_dates(request, context)

    entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(status='approved')
    entries = _apply_date_filter(request, entries, context)

    truncate_date = connection.ops.date_trunc_sql('month','start_time')
    entries = entries.extra({'month':truncate_date})
    entries = entries.values('month', 'project', 'user').annotate(Sum('hours')).order_by('month')
    context['entries'] = entries

    return render(request, template, context)

@login_required
def daily_graph(request, user_id, template="timepiece/graphs/daily_graph.html", context=None):

    if not request.user.is_superuser:
        users = [request.user]
    elif not user_id:
        users = User.objects.all().filter(is_staff=True)
        user = users.order_by("username")
    else:
        users = [User.objects.get(pk=user_id)]

    context = context or {}
    today = datetime.datetime.today().date()
    from_date, to_date =  _get_filter_dates_only(request, context, (today - relativedelta(months=1), today))
    daily_hours = OrderedDict()

    for user in users:
        entries = timepiece.Entry.objects.filter(user=user)
        daily_hours[user.username] = {'daily_hours':{}, 'weekly_average':{}}
        daily, weekly, daily_by_project = _get_daily_hours(user, entries, from_date, to_date)
        daily_hours[user.username]['daily_hours'] = daily
        daily_hours[user.username]['weekly_average'] = weekly
        daily_hours[user.username]['daily_hours_by_project'] = daily_by_project

        events_in_range = timepiece.CalendarEvent.objects\
                                                 .filter(start__gte=from_date, start__lte=to_date)\
                                                 .values('start', 'hours')
        user_events = events_in_range.filter(user=user)
        daily_hours[user.username]['sick_days'] = user_events.filter(event_type='sickday')
        daily_hours[user.username]['leave_days'] = user_events.filter(event_type='leave')
        daily_hours[user.username]['office_closed'] = user_events.filter(event_type='office_closed')
        daily_hours[user.username]['public_holidays'] = timepiece.Holiday.objects.filter(applies_on__gte=from_date, applies_on__lte=to_date)

    context['daily_hours'] = daily_hours
    context['from_date'] = from_date
    context['to_date'] = to_date
    context['default_user_id'] = user_id

    return render(request, template, context)

@login_required
def graphs(request, template="timepiece/graphs/graph.html", context=None):

    if not request.user.is_superuser:
        return HttpResponse("")

    context = context or {}

    if request.GET:
        entries = timepiece.Entry.objects\
                                 .filter_by_logged_in_user(request.user)\
                                 .filter(status='approved')

    else:
        entries = timepiece.Entry.objects.none()

    entries, form = _apply_search_filter_on_entries(request, entries, context)

    series = []
    if form.is_valid() and 'all_hours' in form.cleaned_data['enabled_series']:
        series.append(_create_hours_series_for_graphs(request, entries, context))
    if form.is_valid() and 'billable_hours' in form.cleaned_data['enabled_series']:
       series.append(_create_billable_hours_series_for_graphs(request, entries, context))
    if form.is_valid() and 'expected_hours' in form.cleaned_data['enabled_series']:
        series.append(_create_expected_hours_series_for_graphs(request, entries, context))
    if form.is_valid() and 'atrate' in form.cleaned_data['enabled_series']:
        series.append(_create_atrate_series_for_graphs(request, entries, context))
    if form.is_valid() and 'salaries' in form.cleaned_data['enabled_series']:
        series.append(_create_salary_series_for_graphs(request, entries, context))
    if form.is_valid() and 'expenses' in form.cleaned_data['enabled_series']:
        series.append(_create_expenses_series_for_graphs(request, entries, context))
    if form.is_valid() and 'invoices' in form.cleaned_data['enabled_series']:
        series.append(_create_invoice_series_for_graphs(request, entries, context))
    if form.is_valid() and 'cash_flow_atrate_with_expenses' in form.cleaned_data['enabled_series']:
        series.append(_create_cash_flow_atrate_with_expenses_series_for_graphs(request, entries, context))
    if form.is_valid() and 'cash_flow_atrate' in form.cleaned_data['enabled_series']:
        series.append(_create_cash_flow_atrate_series_for_graphs(request, entries, context))
    if form.is_valid() and 'cash_flow_invoiced' in form.cleaned_data['enabled_series']:
        series.append(_create_cash_flow_invoiced_series_for_graphs(request, entries, context))

    if 'from_date' not in context:
        # Ensure that the date filer form exists
        _get_filter_dates(request, context)

    context['series'] = series

    return render(request, template, context)

def _get_daily_hours(user, entries, from_date=None, to_date=None):

    entries = entries.filter(start_time__gte=from_date, start_time__lte=to_date).extra({'on_day':'date(start_time)'})
    entries_hours_per_day = entries.values('on_day').order_by("on_day").annotate(total_hours=Sum('hours'))
    daily_hours_by_project = entries.values('on_day', 'issue__project__business__name', 'issue__project__name').order_by("on_day", "issue__project__business__name", "issue__project__name").annotate(total_hours=Sum('hours'))

    hours_per_day = {}
    for entry_hours_per_day in entries_hours_per_day:
        hours_per_day[entry_hours_per_day['on_day']] = entry_hours_per_day['total_hours']

    hours = OrderedDict()
    daily_average_hours_per_week = OrderedDict()

    running_date = from_date
    running_hours_per_week = 0
    running_days_in_week = 0
    while running_date <= to_date:

        hours_this_day = hours_per_day.get(running_date, 0)
        hours[running_date] = hours_this_day

        if running_date.weekday() == 0:
            running_days_in_week = 0
            running_hours_per_week = 0

        running_hours_per_week += hours_this_day

        if not timepiece.Holiday.is_a_holiday(running_date) and not timepiece.CalendarEvent.is_on_leave(running_date, user):
            running_days_in_week += 1

        daily_average_hours_per_week[running_date] = float(running_hours_per_week)/(running_days_in_week or 1)
        running_date += relativedelta(days=1)

    return hours, daily_average_hours_per_week, daily_hours_by_project

def _create_hours_series_for_graphs(request, entries, context):
    entries = entries.order_by("start_time")
    cumulative = _get_cumulative_starting_hours(request, entries, context)
    entries = _apply_date_filter(request, entries, context)
    for entry in entries:
        cumulative += entry.hours
        entry.graph_value = cumulative
        entry.bar_value = entry.hours
    return { "label": "all hours (%s)" % cumulative, "entries":entries, "yaxis":1 }

def _create_billable_hours_series_for_graphs(request, entries, context):
    entries = entries.order_by("start_time")
    cumulative = _get_cumulative_starting_hours(request, entries, context)
    entries = _apply_date_filter(request, entries, context)
    entries = entries.filter(project__billable=True)

    for entry in entries:
        cumulative += entry.hours
        entry.graph_value = cumulative
        entry.bar_value = entry.hours
    return { "label": "billable hours (%s)" % cumulative, "entries":entries, "yaxis":1 }

def _create_expected_hours_series_for_graphs(request, entries, context):
    cumulative = 0
    def daterange(from_date, to_date):
        return rrule(DAILY, dtstart=from_date, until=to_date, byweekday=(MO,TU,WE,TH,FR))

    users = entries.values("user").annotate(usercount=Sum("user"))
    entries = []
    from_date, to_date = _get_filter_dates(request, context)
    for date in daterange(from_date, to_date):
        for user in users:
            if user['usercount']>0:
                cumulative += 8
                entries.append( { "start_time":date,
                                  "graph_value": cumulative })
    return { "label": "business hours (%s)" % cumulative, "entries":entries, "yaxis":1 }

def _create_atrate_series_for_graphs(request, entries, context):
    entries = _get_atrate_entries_for_series(request, entries, context)
    cumulative = 0
    for entry in entries:
        cumulative += entry.atrate
        entry.graph_value = cumulative
        entry.bar_value = entry.atrate
    return { "label": "atrate (R%s)" % cumulative, "cumulative": cumulative, "entries":entries, "yaxis":2 }

def _get_atrate_entries_for_series(request, entries, context):
    entries = entries.order_by("start_time")
    entries = _apply_date_filter(request, entries, context)
    return entries

def _create_salary_series_for_graphs(request, entries, context):
    salaries =_get_salaries_for_graphs(request, entries, context)
    cumulative = 0
    for salary in salaries:
        salary.start_time = salary.date
        cumulative += salary.amount
        salary.graph_value = cumulative

    return { "label": "salaries (R%s)" % cumulative, "entries":salaries, "yaxis":2 }

def _get_salaries_for_graphs(request, entries, context):
    entries = entries.order_by("start_time")
    from_date, to_date = _get_filter_dates(request, context)
    salaries = timepiece.Salary.objects.all().order_by("date")
    salaries = salaries.filter(date__gte=from_date, date__lte=to_date)

    form = timepiece_forms.SalaryFilterForm(request.GET or None)
    if form.is_valid():
        form_args = form.save()
        salaries = salaries.filter(**form_args)
    return salaries

def _create_expenses_series_for_graphs(request, entries, context):
    expenses = _get_expenses_for_series(request, entries, context)
    expenses.sort(key = operator.attrgetter('date'))
    cumulative = 0
    for expense in expenses:
        expense.start_time = expense.date
        cumulative += expense.amount
        expense.graph_value = cumulative

    return { "label": "expenses (R%s)" % cumulative, "entries":expenses, "yaxis":2 }

def _get_expenses_for_series(request, entries, context):
    from_date, to_date = _get_filter_dates(request, context)
    expenses = timepiece.Expense.objects.all().order_by("date")
    expenses = expenses.filter(date__gte=from_date, date__lte=to_date)
    salaries = _get_salaries_for_graphs(request, entries, context)
    return list(expenses) + list(salaries)

def _create_invoice_series_for_graphs(request, entries, context):
    cumulative = 0
    invoices = _get_invoices_for_graphs(request, entries, context)
    for invoice in invoices:
        invoice.start_time = invoice.dateIssued
        cumulative += invoice.total_ex_vat
        invoice.graph_value = cumulative

    return { "label": "invoices (R%s)" % cumulative, "entries":invoices, "yaxis":2 }

def _get_invoices_for_graphs(request, entries, context):
    from_date, to_date = _get_filter_dates(request, context)
    invoices = bamboo_models.BambooInvoice.objects.using('bamboo').order_by("dateIssued")
    invoices = invoices.filter(dateIssued__gte=from_date, dateIssued__lte=to_date)
    return invoices

def _create_cash_flow_atrate_with_expenses_series_for_graphs(request, entries, context):
    cumulative = 0
    from_date, to_date = _get_filter_dates(request, context)

    entries = list(_get_expenses_for_series(request, entries, context)) + \
              list(_get_atrate_entries_for_series(request, entries, context))
    entries.sort(key = lambda x: x.start_time if isinstance(x,timepiece.Entry) else datetime.datetime(x.date.year, x.date.month, x.date.day)  )
    for entry in entries:
        if isinstance(entry, timepiece.Expense):
            cumulative -= entry.amount
            entry.bar_value = -entry.amount
        elif isinstance(entry, timepiece.Salary):
            cumulative -= entry.amount
            entry.bar_value = -entry.amount
        elif isinstance(entry, timepiece.Entry):
            cumulative += entry.atrate
            entry.bar_value = entry.atrate
        else:
            raise Exception("Unexpected cashflow model: %s" % entry)
        entry.graph_value = cumulative

    return { "label": "Cashflow atrate (R%s)" % cumulative, "entries":entries, "yaxis":2 }

def _create_cash_flow_atrate_series_for_graphs(request, entries, context):
    cumulative = 0
    from_date, to_date = _get_filter_dates(request, context)

    entries = list(_get_salaries_for_graphs(request, entries, context)) + \
              list(_get_atrate_entries_for_series(request, entries, context))
    entries.sort(key = lambda x: x.start_time if isinstance(x,timepiece.Entry) else datetime.datetime(x.date.year, x.date.month, x.date.day)  )
    for entry in entries:
        if isinstance(entry, timepiece.Salary):
            cumulative -= entry.amount
            entry.bar_value = -entry.amount
        elif isinstance(entry, timepiece.Entry):
            cumulative += entry.atrate
            entry.bar_value = entry.atrate
        else:
            raise Exception("Unexpected cashflow model: %s" % entry)
        entry.graph_value = cumulative

    return { "label": "Cashflow atrate (R%s)" % cumulative, "entries":entries, "yaxis":2 }

def _create_cash_flow_invoiced_series_for_graphs(request, entries, context):
    from_date, to_date = _get_filter_dates(request, context)

    entries = list(_get_expenses_for_series(request, entries, context)) + \
              list(_get_invoices_for_graphs(request, entries, context))
    entries.sort(key = lambda x: x.dateIssued if isinstance(x,bamboo_models.BambooInvoice) else x.date )
    cumulative = 0
    for entry in entries:
        if isinstance(entry, bamboo_models.BambooInvoice):
            cumulative += float(entry.total_ex_vat)
            entry.bar_value = float(entry.total_ex_vat)
            entry.start_time = datetime.datetime(entry.dateIssued.year, entry.dateIssued.month, entry.dateIssued.day)
        elif isinstance(entry, timepiece.Salary):
            cumulative -= float(entry.amount)
            entry.bar_value = -float(entry.amount)
            entry.start_time = datetime.datetime(entry.date.year, entry.date.month, entry.date.day)
        elif isinstance(entry, timepiece.Expense):
            cumulative -= float(entry.amount)
            entry.bar_value = -float(entry.amount)
            entry.start_time = datetime.datetime(entry.date.year, entry.date.month, entry.date.day)
        else:
            raise Exception("Unexpected cashflow model: %s" % entry)
        entry.graph_value = cumulative

    return { "label": "Cashflow invoiced (R%s)" % cumulative, "entries":entries, "yaxis":2 }

def _get_cumulative_starting_hours(request, entries, context):
    return 0
    # entries = _get_cumulative_common_entries(request, entries, context)
    # entries_annotated = entries.aggregate(sum_hours=Sum('hours'))
    # return entries_annotated['sum_hours'] or 0

def _get_cumulative_common_entries(request, entries, context):
    """ returns entries older than from_date """
    from_date, to_date = _get_filter_dates(request)
    if from_date is not None:
        entries = entries.filter(end_time__lte=from_date, status='approved')
    return entries

def _apply_search_filter_on_entries(request, entries, context):
    """ Note: excludes dates filters """
    form = timepiece_forms.GraphFilterForm(request.user, request.GET or None)
    if form.is_valid():
        form_args = form.save()
        entries = entries.filter(**form_args)
    context['search_filter_form'] = form
    return entries, form

def _apply_date_filter(request, entries, context):
    from_date, to_date = _get_filter_dates(request, context)
    dates = Q()
    if from_date:
        dates &= Q(start_time__gte=from_date)
    if to_date:
        dates &= Q(end_time__lte=to_date)
    entries = entries.filter(dates)
    entries = entries.order_by("start_time")
    return entries

def _get_filter_dates(request, context=None):
    from_date = datetime.datetime.today().date().replace(month=1,day=1)
    to_date = datetime.datetime.today().date().replace(month=1,day=1) + relativedelta(years=1)
    initial = {'to_date': to_date, 'from_date': from_date}
    date_form = timepiece_forms.DateForm(request.GET, initial=initial)
    if request.GET and date_form.is_valid():
        from_date, to_date = date_form.save()
        if to_date:
            to_date -= relativedelta(days=1)

    from_date = from_date or initial['from_date']
    to_date = to_date or initial['to_date'] - relativedelta(days=1)

    if context is not None:
        context['from_date'] = from_date
        context['to_date'] = to_date
        context['date_form'] = date_form

    return from_date, to_date

def _get_filter_dates_only(request, context=None, default=None):
    """Retrieves from_date and to_date from request.

    Differs from _get_filter_dates by returning DateOnlyForm
    instead of DateForm and returning None for from_date and
    to_date if no value specified for the respective arg."""

    from_date = datetime.datetime.today().date().replace(month=1,day=1)
    to_date = datetime.datetime.today().date().replace(month=1,day=1) + relativedelta(years=10)
    date_form = timepiece_forms.DateOnlyForm(request.GET)
    if request.GET and date_form.is_valid():
        from_date, to_date = date_form.save()
    else:
        if default:
            from_date = default[0]
            to_date = default[1]
            date_form = timepiece_forms.DateOnlyForm({'to_date': to_date,
                                                     'from_date': from_date})

        else:
            from_date, to_date = (None, None)

    if context is not None:
        context['from_date'] = from_date
        context['to_date'] = to_date
        context['date_form'] = date_form

    return from_date, to_date

@permission_required('timepiece.expenses')
@login_required
def expense_list(request, template='timepiece/expense/index.html', context=None):

    context = context or {}

    from_date, to_date = _get_filter_dates(request, context)
    queryset = timepiece.Expense.objects.filter(date__gte=from_date, date__lte=to_date)
    project = request.GET.get('project_id')
    if project:
        queryset = queryset.filter(project__id=project)

    expense_formset = timepiece_forms.expense_formset(request.POST or None,
                                                      queryset = queryset.order_by("date"))
    if expense_formset.is_valid():
        expense_formset.save()

    context['expense_formset'] = expense_formset
    context['total'] = queryset.aggregate(total=Sum('amount'))['total']

    return render(request, template, context)

@login_required
def invoice_list(request, template='timepiece/invoice/index.html', context=None):

    context = context or {}

    project_id = request.GET.get('project_id')
    context['project'] = timepiece.Project.objects.get(pk=project_id)
    has_view_invoices = timepiece.BusinessPermissions.objects.get_or_create(business=context['project'].business, user=request.user)[0].has_edit_invoices
    if not has_view_invoices:
        raise PermissionDenied

    from_date, to_date = _get_filter_dates_only(request, context)

    query = Q()
    if from_date:
        query = Q(date_sent__gte=from_date)

    if to_date:
        query = query & Q(date_sent__lte=to_date)

    if from_date or to_date:
        query = query | Q(date_sent__isnull=True)

    queryset = Invoice.objects.filter_by_logged_in_user(request.user).filter(query)
    project_id = request.GET.get('project_id')
    if project_id:
        queryset = queryset.filter(project__id=project_id)
        context['project'] = timepiece.Project.objects.get(pk=project_id)

    invoice_formset = timepiece_forms.invoice_formset(request.POST or None,
                                                      queryset = queryset.order_by("date_sent"))
    if invoice_formset.is_valid():
        if project_id:
            for model in invoice_formset.save(commit=False):
                model.project = context['project']
                model.save()
            invoice_formset.save_m2m()
        else:
            invoice_formset.save()

        return HttpResponseRedirect(reverse('invoice_list')+"?project_id=%s"%project_id)

    context['invoice_formset'] = invoice_formset
    context['total'] = queryset.aggregate(total=Sum('amount'))['total']
    context['project_id'] = project_id

    return render(request, template, context)


@csrf_exempt
@permission_required('timepiece.change_project')
@login_required
def create_expense(request, context=None):
    project_id = float(request.POST['project_id'])
    amount = float(request.POST['amount'])
    description = request.POST['description']
    date = request.POST['date']
    date = datetime.datetime.strptime(date, "%m/%d/%Y").date()
    paid = request.POST['paid'] == u'true'

    project = timepiece.Project.objects.get(pk=project_id)
    expense = timepiece.Expense.objects.create(project=project, amount=str(amount), description=description, date=date, paid=paid)
    expense.save()
    return HttpResponse("")

@csrf_exempt
@permission_required('timepiece.change_project')
@login_required
def create_invoice(request, context=None):
    project_id = float(request.POST['project_id'])
    date_sent = request.POST['date_sent']
    date_paid = request.POST['date_paid']
    description = request.POST['description']
    amount = request.POST['amount']
    invoice_number = request.POST['invoice_number']
    paid = request.POST['paid'] == u'true'

    if date_paid:
        date_paid = datetime.datetime.strptime(date_paid, "%m/%d/%Y").date()
    else:
        date_paid = None

    if date_sent:
        date_sent = datetime.datetime.strptime(date_sent, "%m/%d/%Y").date()
    else:
        date_sent = None

    project = timepiece.Project.objects.get(pk=project_id)
    invoice = timepiece.Invoice.objects.create(project=project,
         date_paid=date_paid, date_sent=date_sent, description=description,
         amount=amount, invoice_number=invoice_number, paid=paid)
    invoice.save()
    return HttpResponse(json.dumps({'one': 'two'}))

@csrf_exempt
@permission_required('timepiece.change_project')
@login_required
def time_sheet_download(request, user_id, context=None):
    context = context or {}
    to_date = datetime.datetime.strptime(request.GET['to_date'], "%Y%m%d").date() + datetime.timedelta(1)
    from_date = datetime.datetime.strptime(request.GET['from_date'], "%Y%m%d").date()
    entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(start_time__gte=from_date).filter(end_time__lte=to_date)

    if int(user_id) > 0:
        entries = entries.filter(user__id=int(user_id))

    entries = entries.order_by("user__username").order_by("project__name").order_by("start_time")

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=entries_%s_%s.csv' % (request.GET['from_date'], request.GET['to_date'])
    writer = csv.writer(response)
    for entry in entries:
        writer.writerow( [ entry.user.username.encode("utf8"), entry.issue.project.business.name.encode("utf8"), entry.issue.project.name.encode("utf8"),
                           entry.start_time.strftime("%Y-%m-%d"), entry.hours, entry.comments.encode("utf8") ] )

    return response



@login_required
def add_project(request, business_id , template="timepiece/project/create_edit_project_form.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    context['business'] = business
    context['current_user'] = request.user
    project = timepiece.Project(  business = business,
                                  point_person = request.user,
                                  type = timepiece.Attribute.objects.get(label="default"),
                                  status3 = timepiece.ProjectStatus.for_business('open', business)
    )

    has_create_sprint = timepiece.BusinessPermissions.objects.get_or_create(business=business, user=request.user)[0].has_create_sprint
    if not has_create_sprint:
        raise PermissionDenied

    has_edit_budget = timepiece.BusinessPermissions.objects.get_or_create(business=business, user=request.user)[0].has_edit_budget

    form = timepiece_forms.NewProjectForm(request.POST or None, instance=project)
    context['project_form'] =form;
    if form.is_valid():
        project= form.save()
        if not has_edit_budget:
            project.budget = 0
        project.save()
        context['project'] = project
        return get_project_row(request, project.id, context= context)

    context['project'] = project
    context['business_permissions_by_user'] = timepiece.BusinessPermissions.by_user(business)
    return render(request, template, context)

@login_required
def add_issue(request, project_id, template="timepiece/project/_add_issue_form.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]

    current_business = project.business

    context['next_issue_number'] = next_issue_number = timepiece.Issue.get_next_issue_number(current_business)
    context['project'] = project
    context['current_user'] = request.user
    current_user = request.user

    bp = timepiece.BusinessPermissions.for_user(current_user, current_business)
    if bp.has_add_issue:
        new_issue_form = timepiece_forms.IssueForm(request.POST or None, business=current_business)
        plugin_form = get_interface_plugin(request, project.business).get_create_issue_form(request.POST or None)

        if new_issue_form.is_valid() and (plugin_form is None or plugin_form.is_valid()):
            issue = new_issue_form.save(commit=False)
            issue.created_by = request.user
            issue.number = next_issue_number
            issue.project = project
            issue.save()

            if bp.has_estimate_own_points:
                estimated_hours = new_issue_form.cleaned_data['estimated_hours']
                if estimated_hours > 0:
                    timepiece.IssuePoints.objects.create(user=current_user, issue=issue, points=estimated_hours)

            timepiece.IssueHistory.add_history(request.user, issue, "created", "", issue.number)

            get_interface_plugin(request, project.business).create_issue(issue, plugin_form)

            return get_issue_row(request, issue.id)
    else:
        plugin_form = get_interface_plugin(request, project.business).get_create_issue_form()

    context['plugin_form'] = plugin_form
    context['business'] = current_business
    context['new_issue_form'] = new_issue_form;
    return render(request, template, context)

@csrf_exempt
@login_required
def delete_issue(request, project_id, template="", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]
    current_business = project.business
    context['project'] = project

    current_user = request.user

    can_delete_issue = timepiece.BusinessPermissions.objects.get_or_create(business=current_business, user=current_user)[0].has_delete_issue
    if can_delete_issue:
        try:
            edited_issue = timepiece.Issue.objects.get(pk=request.POST['item_id'])
            old_id = edited_issue.id
            timepiece.IssueHistory.add_history(request.user, edited_issue, "deleted", old_id, "")
            edited_issue.delete()
        except KeyError:
            edited_issue = None


    return HttpResponse("")

def _augment_issue_data(issue, current_user, users_allowed_to_estimate_on_business, rates_by_user=None):

    issue_points_by_user = issue.get_issue_points_by_user()
    issue_hours_by_user = issue.get_issue_hours_by_user()

    if rates_by_user is None:
        rates_by_user = issue.project.get_rates_by_user()

    issue.representation.ctc = 0
    issue.representation.billable = 0
    issue.representation.estimated_cost = 0

    for user in users_allowed_to_estimate_on_business:

        per_user_issue_data = {}

        user_points = issue_points_by_user.get(user.id, 0)
        per_user_issue_data["issue_points"] = user_points
        hours = issue_hours_by_user.get(user.id, 0)

        rate = rates_by_user[user.id] if user.id in rates_by_user else None

        if user_points == 0:
            completion_against_estimated_hours = 0
        else:
            completion_against_estimated_hours = ((hours/user_points)*100) if user_points>0 else 0.0


        per_user_issue_data["completion"] = completion_against_estimated_hours
        per_user_issue_data["hours"] = hours
        per_user_issue_data["has_hours"] = per_user_issue_data["hours"]>0
        per_user_issue_data["completion_width"] = completion_against_estimated_hours

        if per_user_issue_data["completion_width"] > 100:
            per_user_issue_data["completion_width"] = 100
            per_user_issue_data["bar_color"]= "traffic_red"
            per_user_issue_data["completion"] = 200 if per_user_issue_data["completion"] > 200 else per_user_issue_data["completion"]
        else:
            per_user_issue_data["bar_color"] = "traffic_green"

        if per_user_issue_data["completion_width"]>100:
            per_user_issue_data["completion_width"] = 100


        per_user_issue_data["has_estimate"] =  (per_user_issue_data["issue_points"] is not None and per_user_issue_data["issue_points"]>0) or per_user_issue_data["completion"]>0
        per_user_issue_data["can_estimate"] = True
        issue.add_user_to_representation(user, per_user_issue_data)

        if rate:
            issue.representation.ctc += hours * rate['ctc_amount']
            issue.representation.billable += hours * rate['billable_amount']
            estimated_cost = user_points * timepiece.Rate.convert_to_full_rate(issue.project, rate['billable_amount']) * rate['velocity']
            issue.representation.estimated_cost += estimated_cost

        if current_user.id == user.id:
            issue.representation.current_user_issue_data = per_user_issue_data

    if issue.is_fixed_ctc_cost():
        issue.representation.ctc += float(issue.fixed_ctc_amount)

    if issue.is_fixed_cost():
        issue.representation.billable += float(issue.fixed_amount)

    # for user, hours in issue.hours_for_users():
    #     if user not in users_allowed_to_estimate_on_business:
    #         # users with hours but without estimates need a column too
    #         per_user_issue_data["hours"] = hours
    #         per_user_issue_data["has_hours"] = True
    #         per_user_issue_data["has_estimate"] = False
    #         per_user_issue_data["can_estimate"] = False
    #         issue.add_user_to_representation(user, per_user_issue_data)

@login_required
def status_filter(request, project_id, template="timepiece/project/status_filter_popup.html"):
    context = {}
    stati = timepiece.Issue.objects.filter(project_id=project_id).order_by('status2__name').values_list('status2__name', flat=True).distinct()
    context['stati'] = stati
    context['project_id'] = project_id
    return render(request, template, context)

@login_required
def allowed_issue_stati(request, issue_id):
    issue = timepiece.Issue.objects.get(pk=issue_id)
    stati = get_interface_plugin(request, issue.project.business).get_allowed_stati(issue)
    if stati is None:
        stati = [(x.id, x.name) for x in timepiece.IssueStatus.objects.filter(business_id=issue.project.business_id).order_by("name")]
    return HttpResponse(json.dumps(stati), content_type='application/json')

@login_required
def business_users(request, business_id, issue_id):
    business = timepiece.Business.objects.get(pk=business_id)
    users = [ (user.id, user.get_full_name()) for user in business.users ]
    return HttpResponse(json.dumps(users),
                        content_type='application/json')

@login_required
def issue_users(request, issue_id):
    issue = timepiece.Issue.objects.get(pk=issue_id)
    business = issue.project.business
    users = get_interface_plugin(request, business).get_assignable_users(issue)

    if users is None:
        users = [ (user.id, "%s (%s)" % (user.username, user.get_full_name())) for user in business.users ]
    return HttpResponse(json.dumps(users),
                        content_type='application/json')

@csrf_exempt
@login_required
def business_issues(request, pk):
    return HttpResponseRedirect(reverse('closed_project_list', args=[pk]))

@csrf_exempt
@login_required
def project_issues(request, pk, template="timepiece/project/issues.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=pk).filter_by_logged_in_user(request.user)[0]
    business = project.business

    queryset = project.get_ordered_issues()
    issues_forms = timepiece_forms.createIssueStatusFormset(business)(
        request.POST or None,
        queryset=queryset)
    users_allowed_to_estimate_on_business=business.get_users_allowed_to_estimate_on_business(request.user)
    rates_by_user = project.get_rates_by_user()
    for form in issues_forms.forms:
        _augment_issue_data(form.instance,request.user,
                            users_allowed_to_estimate_on_business=users_allowed_to_estimate_on_business,
                            rates_by_user=rates_by_user)

    new_issue_form = timepiece_forms.IssueForm()

    all_entries = timepiece.Entry.objects.filter(issue__project=project).order_by("start_time")
    cost_totals = all_entries.cost_totals_for_project(project)
    unassigned_cost_totals = timepiece.Issue.get_adhoc_timesheet_entries(project=project).cost_totals_for_project(project)

    rate = project.get_user_rate(request.user)
    context['next_issue_number']  = timepiece.Issue.get_next_issue_number(project.business)
    context['current_user_rate'] = float(rate.amount) if rate else 0.0
    context['business'] = business
    context['new_issue_form'] = new_issue_form
    context['current_user'] = request.user
    context['project'] = project

    context['assign_user_form'] = timepiece_forms.AssignUserToIssueForm(business=business)
    context['total_hours'] = cost_totals['hours']
    context['total_ctc'] = cost_totals['ctc']
    context['total_billable'] = cost_totals['billable']
    context['unassigned_timesheet_entries_hours'] = unassigned_cost_totals['hours']
    context['unassigned_timesheet_entries_ctc'] = unassigned_cost_totals['ctc']
    context['unassigned_timesheet_entries_billable'] = unassigned_cost_totals['billable']
    context['issues_forms'] = issues_forms
    context['business_permissions_by_user'] = timepiece.BusinessPermissions.by_user(business)

    timings.results()
    return render(request, template, context)

@csrf_exempt
@login_required
def get_project_detail(request, project_id, context=None):
    context = context or {}

    timings.start("get_project_detail")

    try:
        project = timepiece.Project.objects.filter(pk=project_id)[0]
    except IndexError, ex:
        logger.exception(ex)
        raise Exception("No permission to view this project: %s" % project.name)
    context['project'] = project

    business = project.business

    queryset = project.get_ordered_issues().select_related("assigned_to")
    issues_forms = None

    context['users_with_time_but_no_estimates_in_this_project'] = project.get_users_with_time_but_no_estimates_in_this_project()

    if len(queryset) :
        issues_forms = timepiece_forms.createIssueStatusFormset(business=business)(request.POST or None,
                                                                                   queryset=queryset)
        users_allowed_to_estimate_on_business=business.get_users_allowed_to_estimate_on_business(request.user)
        rates_by_user = project.get_rates_by_user()
        for form in issues_forms.forms:
            _augment_issue_data(form.instance, request.user,
                                users_allowed_to_estimate_on_business=users_allowed_to_estimate_on_business,
                                rates_by_user=rates_by_user)

    new_issue_form = timepiece_forms.IssueForm()

    all_entries = timepiece.Entry.objects.filter(issue__project=project).order_by("start_time")

    cost_totals = all_entries.cost_totals_for_project(project)
    unassigned_cost_totals = timepiece.Issue.get_adhoc_timesheet_entries(context['project']).cost_totals_for_project(context['project'])

    rate = project.get_user_rate(request.user)
    context['next_issue_number']  = timepiece.Issue.get_next_issue_number(project.business)
    context['current_user_rate'] = float(rate.amount) if rate else 0.0
    context['business'] = business
    context['new_issue_form'] = new_issue_form
    context['current_user'] = request.user
    context['project'] = project
    context['unassigned_timesheet_entries_hours'] = unassigned_cost_totals['hours']
    context['unassigned_timesheet_entries_ctc'] = unassigned_cost_totals['ctc']
    context['unassigned_timesheet_entries_billable'] = unassigned_cost_totals['billable']
    context['assign_user_form'] = timepiece_forms.AssignUserToIssueForm()
    context['issues_forms'] = issues_forms
    context['total_hours'] = cost_totals['hours']
    context['total_ctc'] = cost_totals['ctc']
    context['total_billable'] = cost_totals['billable']
    context['business_permissions_by_user'] = timepiece.BusinessPermissions.by_user(business)
    context['has_closed_sprints'] = business.has_closed_sprints()

    dev_stats = calculate_dev_hours_stats(project, request.user)
    dev_hours_available, dev_hours_used, ratio, manager_rate, developer_rate, tester_rate = dev_stats

    values = {
            'manager_rate':  calculate_progress_ratio(manager_rate, ratio),
            'developer_rate': calculate_progress_ratio(developer_rate, ratio),
            'tester_rate':  calculate_progress_ratio(tester_rate, ratio),
            'has_budget': project.spendable_budget > 0,
            'percentage_over_budget': float(context['total_billable'] - project.spendable_budget)/project.spendable_budget if project.spendable_budget else 0,
            'dev_hours_available': dev_hours_available
    }

    context['has_open_sprints'] = business.has_open_sprints()

    plot_data = {}
    plot_data.setdefault(project_id, [])

    plot_data[project_id].append({'project': project.name,
                                  'values': values,
                                  'dev_hours_used': dev_hours_used })

    context['plot_data_json'] = json.dumps(plot_data)


    if 'selected_issue_ids_for_context_menu' in request.session:
        context['selected_issue_ids'] = [int(x) for x in request.session['selected_issue_ids_for_context_menu']]

    issues_list_rendered = render(request, "timepiece/project/project_detail.html", context)
    #project_menu_rendered = render(request, "timepiece/project/_card_project_menu.html", context)
    project_menu_rendered = render(request, "timepiece/_navigation_project_specific_menu.html", context)
    project_banner_rendered = render(request, "timepiece/project/_project_banner.html", context)

    return HttpResponse(json.dumps({ 'project':project.model_to_dict(include_business=True),
                                     'project_menu': project_menu_rendered.content,
                                     'project_banner': project_banner_rendered.content,
                                     'issue_list_html':issues_list_rendered.content }))

def calculate_progress_ratio(rate, ratio):
    value = round(rate * ratio, 2)
    return value if value < 100 else 100

@login_required
def open_issue(request, business_name=None, issue_number=None):
    business = timepiece.Business.objects.all().filter_by_logged_in_user(request.user).get(name=business_name)
    try:
        issue = timepiece.Issue.objects.get(number=issue_number, project__business=business)
    except timepiece.Issue.DoesNotExist:
        return HttpResponse("Unknown issue number : %s" % issue_number)
    return redirect(reverse('highlighted_project_list', kwargs={'project_id':issue.project_id,
                                                                'highlight_issue_id':issue.id}))

@csrf_exempt
@login_required
def project_list(request, project_id=None, highlight_issue_id=None, business_id=None,
                 template="timepiece/project/project_list.html", context=None):
    """ Displays all projects in the same business as project_id or
    business_id. If project_id is not None, then that project is
    expanded. """

    context = context or {}

    expanded_project = None
    business = None

    if project_id is not None:
        try:
            expanded_project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]
        except IndexError:
            raise PermissionDenied
        business = expanded_project.business
    else:
        business = timepiece.Business.objects.get(pk=business_id)

    has_view_issues = timepiece.BusinessPermissions.objects.get_or_create(business=business, user=request.user)[0].has_view_issues
    if not has_view_issues:
        raise PermissionDenied

    projects = business.get_ordered_projects()
    project_list = []
    for project in projects:
        if project_id is not None and project.id == int(project_id):
            project.is_preloaded = "true"
        project_list.append(project)

    context['current_user'] = request.user
    context['expanded_project'] = expanded_project
    context['projects'] = project_list
    context['business'] = business
    context['business_permissions_by_user'] = timepiece.BusinessPermissions.by_user(business)
    context['highlight_issue_id'] = highlight_issue_id
    context['has_closed_sprints'] = business.has_closed_sprints()
    context['has_open_sprints'] = business.has_open_sprints()

    if 'selected_issue_ids_for_context_menu' in request.session:
        context['selected_issue_ids'] = [int(x) for x in request.session['selected_issue_ids_for_context_menu']]

    return render(request, template, context)

@csrf_exempt
@login_required
def issue_detail(request, issue_id, template="timepiece/project/issue_detail.html", context=None):
    context = context or {}
    issue =  timepiece.Issue.objects.get(pk=issue_id)
    context['issue'] = issue
    testable_formset = TestableFormSet(issue)
    context['testable_formset'] = testable_formset
    context['testables'] = issue.testables.all()

    # if request.POST and testable_formset.is_valid():
    #     for instance in testable_formset:
    #         instance.save()

    context['supports_description'] = True
    project = issue.project
    context['project'] = project

    context['business'] = project.business
    context['current_user'] = request.user
    context['business_permissions_by_user'] = timepiece.BusinessPermissions.by_user(project.business)
    context['issue_number_form'] = timepiece_forms.IssueNumberForm(instance=issue)
    context['is_clocked_in'] = timepiece.Entry.objects.filter(user=request.user, issue_id=issue_id).is_open().count() > 0

    context['timesheet_export_url'] = reverse('issue_detail', args=[issue.id]) + "?timesheet_as_csv=1"
    if 'timesheet_as_csv' in request.GET and request.GET['timesheet_as_csv'] == "1":
        return CSVTimesheetExport(name='issue%d'%issue.number, project=project, timesheet_entries=issue.related_entries, request=request).render_to_response(context)

    return render(request, template, context)

def issue_testables(request, issue_id, template="timepiece/project/_issue_testables_form.html", context=None):
    context = context or {}
    testable_formset = TestableFormSet(issue, request.POST or None)
    context['testable_formset'] = testable_formset
    if request.is_ajax():
        return render(request, template, context)
    return render(request, template, context)

@csrf_exempt
@login_required
def issue_detail_update(request,  template="timepiece/project/issue_detail.html", context=None):
    context = context or {}

    try:
        edited_issue = timepiece.Issue.objects.get(pk=request.POST['item_id'])
    except KeyError:
        edited_issue = None

    project = edited_issue.project
    context['project'] = project
    context['supports_description'] = True
    context['issue_number_form'] = timepiece_forms.IssueNumberForm(instance=edited_issue)

    has_edit_description = timepiece.BusinessPermissions.objects.get_or_create(business=project.business, user=request.user)[0].has_edit_description
    if not has_edit_description:
        raise PermissionDenied

    try:
        old_description = edited_issue.description
        edited_issue.description = request.POST["new_value"]
        edited_issue.save()
        timepiece.IssueHistory.add_history(request.user, edited_issue, "changed description", old_description, edited_issue.description)
    except KeyError:
        pass

    get_interface_plugin(request, project.business).update_issue_description(edited_issue)

    return HttpResponse("")

@csrf_exempt
@login_required
def issue_fixed_cost_update(request, id, template="timepiece/project/issue_detail.html", context=None):
    context = context or {}

    try:
        edited_issue = timepiece.Issue.objects.get(pk=id)
    except KeyError:
        edited_issue = None

    project = edited_issue.project

    has_edit_description = timepiece.BusinessPermissions.objects.get_or_create(business=project.business, user=request.user)[0].has_view_ctc_billable_rates
    if not has_edit_description:
        raise PermissionDenied

    try:
        old_fixed_amount = edited_issue.fixed_amount
        edited_issue.fixed_amount = float(request.POST["fixed_amount"])

        old_fixed_ctc_amount = edited_issue.fixed_ctc_amount
        edited_issue.fixed_ctc_amount = float(request.POST["fixed_ctc_amount"])
        edited_issue.save()
        timepiece.IssueHistory.add_history(request.user, edited_issue, "changed fixed_ctc_amount", old_fixed_ctc_amount, edited_issue.fixed_ctc_amount)
    except KeyError:
        pass

    get_interface_plugin(request, project.business).update_issue_description(edited_issue)


    return HttpResponse("")


@csrf_exempt
@login_required
def issue_status_update(request,  template="timepiece/project/issue_detail.html", context=None):
    context = context or {}

    edited_issue = timepiece.Issue.objects.get(pk=request.POST['issue_id'])
    project = edited_issue.project
    has_edit_status = timepiece.BusinessPermissions.objects.get_or_create(business=project.business, user=request.user)[0].has_edit_issue_states
    if not has_edit_status:
        raise PermissionDenied

    context['project'] = project
    context['supports_description'] = True
    context['issue_number_form'] = timepiece_forms.IssueNumberForm(instance=edited_issue)

    old_status = edited_issue.status2.name if edited_issue.status2 else ""
    issue_status_id = request.POST["selected_value"].strip()
    if not issue_status_id:
        edited_issue.status2 = None
        new_status = None
    else:
        new_status = timepiece.IssueStatus.objects.get(business_id=project.business_id, pk=issue_status_id)
    edited_issue.status2 = new_status
    timepiece.IssueHistory.add_history(request.user, edited_issue, "changed status", old_status, new_status)
    edited_issue.save()

    get_interface_plugin(request, project.business).update_issue_status(edited_issue)

    return HttpResponse(json.dumps({ 'new_value': str(new_status) }), content_type='application/json')

@csrf_exempt
@login_required
def issue_assigned_to_update(request,  template="timepiece/project/issue_detail.html", context=None):
    context = context or {}

    issue = timepiece.Issue.objects.get(pk=request.POST['issue_id'])
    username = request.POST['selected_value']
    try:
        user = User.objects.get(pk=username)
    except User.DoesNotExist:
        user = None
    except ValueError:
        user = None

    project = issue.project
    context['project'] = project
    context['supports_description'] = True
    context['issue_number_form'] = timepiece_forms.IssueNumberForm(instance=issue)

    has_assign_user = timepiece.BusinessPermissions.objects.get_or_create(business=project.business, user=request.user)[0].has_assign_user
    if not has_assign_user:
        raise PermissionDenied

    old_assigned = issue.assigned_to
    issue.assigned_to = user
    issue.save()
    timepiece.IssueHistory.add_history(request.user, issue, "assigned user", old_assigned, issue.assigned_to)

    get_interface_plugin(request, project.business).update_issue_assigned_to(issue, username)

    return HttpResponse(json.dumps({ 'new_value': issue.assigned_to.username if issue.assigned_to else None }), content_type='application/json')

@csrf_exempt
@login_required
def issue_subject_update(request,  template="timepiece/project/issue_detail.html", context=None):
    context = context or {}

    try:
        edited_issue = timepiece.Issue.objects.get(pk=request.POST['item_id'])
    except KeyError:
        edited_issue = None

    project = edited_issue.project
    context['project'] = project
    context['supports_description'] = True
    context['issue_number_form'] = timepiece_forms.IssueNumberForm(instance=edited_issue)

    has_edit_subject = timepiece.BusinessPermissions.objects.get_or_create(business=project.business, user=request.user)[0].has_edit_subject
    if not has_edit_subject:
        raise PermissionDenied
    try:
        old_subject = edited_issue.subject
        edited_issue.subject = request.POST["new_value"]
        edited_issue.save()
        timepiece.IssueHistory.add_history(request.user, edited_issue, "changed subject", old_subject, edited_issue.subject)
        get_interface_plugin(request, project.business).update_issue_subject(edited_issue)
    except KeyError:
        pass

    return HttpResponse("")

@csrf_exempt
@login_required
def issue_points_update(request,  template="timepiece/project/issue_detail.html", context=None):
    context = context or {}
    try:
        user_id = request.POST['item_id']
        user = User.objects.get(pk=user_id)
        issue_id = request.POST['issue_id']
        issue = timepiece.Issue.objects.get(pk=issue_id)
        edited_issue_points = timepiece.IssuePoints.objects.get_or_create(user=user, issue=issue)[0]
    except KeyError:
        edited_issue_points = None

    current_project = edited_issue_points.issue.project

    bp = timepiece.BusinessPermissions.for_user(request.user, current_project.business)
    can_edit_points = bp.has_estimate_own_points and request.user.id == edited_issue_points.user.id

    if not can_edit_points:
        raise PermissionDenied

    old_points = edited_issue_points.points

    if '/' in request.POST["new_value"]:
        """ shorthand way to add actual hours to a user """
        new_actual, new_estimate = request.POST["new_value"].split("/")
        if len(new_actual.strip()) > 0:
            timepiece.Entry.set_hours_for_user(user=request.user, issue=edited_issue_points.issue, new_hours=float(new_actual))
            get_interface_plugin(request, current_project.business).update_issue_actual_hours(edited_issue_points.issue)
    else:
        new_estimate = request.POST["new_value"]

    edited_issue_points.points = float(new_estimate or 0)
    edited_issue_points.save()
    context['issue_number_form'] = timepiece_forms.IssueNumberForm(instance=edited_issue_points.issue)
    timepiece.IssueHistory.add_history(request.user, edited_issue_points.issue, "changed estimate for %s"%edited_issue_points.user, old_points, edited_issue_points.points)
    get_interface_plugin(request, current_project.business).update_issue_points(edited_issue_points)

    return HttpResponse("")

@csrf_exempt
# @permission_required('timepiece.change_project')
@login_required
def unassigned_timesheet_entries(request, project_id, template="timepiece/project/issue_detail.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]
    context['supports_description'] = False
    context['current_user'] = request.user
    context['issue'] = {'id':None,
                        'subject':'Unassigned timesheet entries',
                        'auto_expand_timesheet_entries':True,
                        'project':project,
                        'description':'unassigned timesheet entries',
                        'related_entries':timepiece.Issue.get_adhoc_timesheet_entries(project=project),
                        'sorted_related_entries':timepiece.Issue.get_adhoc_timesheet_entries(project=project).order_by("start_time")}
    context['business'] = project.business
    context['project'] = project
    context['business_permissions_by_user'] = timepiece.BusinessPermissions.by_user(project.business)

    context['timesheet_export_url'] = reverse('unassigned_timesheet_entries', args=[project.id]) + "?timesheet_as_csv=1"
    if 'timesheet_as_csv' in request.GET and request.GET['timesheet_as_csv'] == "1":
        return CSVTimesheetExport(name='noissue', project=project, timesheet_entries=context['issue']['related_entries'], request=request).render_to_response(context)

    return render(request, template, context)

@csrf_exempt
# @permission_required('timepiece.change_project')
@login_required
def all_timesheet_entries(request, project_id, template="timepiece/project/issue_detail.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]
    entries = timepiece.Entry.objects.filter(issue__project=project).order_by("start_time")
    context['supports_description'] = False
    context['current_user'] = request.user
    context['issue'] = {'id':None,
                        'subject':'All timesheet entries',
                        'auto_expand_timesheet_entries':True,
                        'project':project,
                        'description':'all timesheet entries',
                        'related_entries':entries,
                        'sorted_related_entries':entries}
    context['business'] = project.business
    context['project'] = project

    context['business_permissions_by_user'] = timepiece.BusinessPermissions.by_user(project.business)

    context['timesheet_export_url'] = reverse('all_timesheet_entries', args=[project.id]) + "?timesheet_as_csv=1"
    if 'timesheet_as_csv' in request.GET and request.GET['timesheet_as_csv'] == "1":
        return CSVTimesheetExport(name='all', project=project, timesheet_entries=context['issue']['related_entries'], request=request).render_to_response(context)

    return render(request, template, context)

@csrf_exempt
@login_required
def view_project_rates(request, project_id, template="timepiece/project/view_rates.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]
    has_view_ctc_billable_rates = timepiece.BusinessPermissions.objects.get_or_create(business=project.business, user=request.user)[0].has_view_ctc_billable_rates
    if not has_view_ctc_billable_rates:
        raise PermissionDenied

    project.recalc_secondary_estimates()

    context['project'] = project
    context['current_user'] = request.user
    context['users_and_hours'] = project.users_and_hours()
    context['recalculate_url'] = reverse('view_project_rates', args=[project_id])
    context['time_tracking_mode_options'] = ",".join( list( [x for x,y in timepiece.Rate.TIME_TRACKING_MODES] ) )

    return render(request, template, context)

@csrf_exempt
@login_required
def view_rates_summary(request, project_id, template="timepiece/project/view_rates_summary.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]
    has_view_ctc_billable_rates = timepiece.BusinessPermissions.objects.get_or_create(business=project.business, user=request.user)[0].has_view_ctc_billable_rates
    if not has_view_ctc_billable_rates:
        raise PermissionDenied

    project.recalc_secondary_estimates()

    context['project'] = project
    context['users_and_hours'] = project.users_and_hours()

    return render(request, template, context)

@csrf_exempt
@permission_required('timepiece.change_project')
@login_required
def edit_project_rate(request, project_id):
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]

    user_name = request.POST['user_name']
    field_name = request.POST['field_name']
    new_value = request.POST['update_value']

    if 'amount' in field_name:
        if new_value.lower().startswith('r'):
            new_value = new_value[1:]
            try:
                new_value = float(new_value)
            except (ValueError, TypeError):
                return HttpResponse(request.POST['original_value'])

    if field_name.startswith('project__'):
        try:
            # only because all the fields so far are floats, needs to be refactored if it gets more complex
            new_value = float(new_value)
        except (ValueError, TypeError):
            return HttpResponse(request.POST['original_value'])
        if field_name == 'project__ratio_management' and project.ratio_management != new_value:
            project.ratio_management = new_value
            ret_val = new_value
        elif field_name == 'project__ratio_testing':
            project.ratio_testing = new_value
            ret_val = new_value
        elif field_name == 'project__ratio_scope_creep':
            project.ratio_scope_creep = new_value
            ret_val = new_value
        elif field_name == 'project__commission_percentage':
            project.commission_percentage = new_value
            ret_val = new_value
        else:
            ret_val = "Unsupported field"
        project.save()
        project.recalc_secondary_estimates()

    else:
        rate = project.get_user_rate(user_name)

        ret_val = None
        if field_name == 'amount':
            rate.amount = new_value
            rate.save()
            ret_val = "R%s" % rate.amount
        elif field_name == "billable_amount":
            rate.billable_amount = new_value
            rate.save()
            ret_val = "R%s" % rate.billable_amount
        elif field_name == 'velocity':
            try:
                new_value = float(new_value)
            except (ValueError, TypeError):
                return HttpResponse(request.POST['original_value'])
            rate.velocity = new_value
            rate.save()
            return HttpResponse(new_value)
        elif field_name == 'time_tracking_mode':
            rate.time_tracking_mode = new_value
            rate.save()
            ret_val = new_value
        else:
            ret_val = "Unsupported field"

    return HttpResponse(ret_val)

@login_required
@permission_required('timepiece.change_project')
def edit_default_user_rates(request, template="timepiece/person/edit_default_user_rates.html", context=None):
    if not request.user.is_superuser:
        return HttpResponse("")
    context = context or {}
    context['users'] = User.objects.all()
    formset = timepiece_forms.rate_formset(request.POST or None, queryset = timepiece.UserProfile.objects.all().order_by("user__username"))
    if formset.is_valid():
        formset.save()
        _update_all_project_users()
        _update_all_project_rates()
        return HttpResponseRedirect(reverse('edit_default_user_rates'))
    context['formset'] = formset
    return render(request, template, context)

def _update_all_project_rates():
    """ set all missing projects rates with the user's default
    rate. Note projects that already have rates are not updated."""
    for profile in timepiece.UserProfile.objects.all():
        for project in timepiece.Project.objects.filter(users=profile.user):
            rate = project.get_user_rate(profile.user)
            if rate.amount == 0 and rate.billable_amount == 0:
                rate.amount = profile.amount
                rate.billable_amount = profile.billable_amount
                rate.save()

def _update_all_project_users():
    """Make sure all users with entries against a project do belong to
    that project (can be missing for emacs users)"""
    for profile in timepiece.UserProfile.objects.all():
        for project in timepiece.Project.objects.exclude(users=profile.user):
            if timepiece.Entry.objects.filter(user=profile.user,issue__project=project).count()>0:
                timepiece.ProjectRelationship.objects.get_or_create(user=profile.user, project=project)

@login_required
def income_summary(request, template="timepiece/graphs/income_summary.html", context=None):
    context = context or {}
    if not request.user.is_superuser:
        return HttpResponse("")
    today = datetime.datetime.today().date()
    from_date, to_date =  _get_filter_dates_only(request, context, (today - relativedelta(months=1), today))

    date_form = timepiece_forms.DateOnlyForm(request.GET)
    context['date_form'] = date_form

    if request.GET:
        entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user)
    else:
        entries = timepiece.Entry.objects.none()
    entries = _apply_date_filter(request, entries, context)

    per_user = {}
    per_user_per_business = {}
    per_business = {}
    ctc_total = 0
    billable_total = 0

    for entry in entries:
        ctc_total += entry.atrate
        billable_total += entry.atbillablerate

        per_user.setdefault(entry.user.username, {'ctc':0,'billable':0, 'hours':0})
        per_user[entry.user.username]['ctc'] += entry.atrate
        per_user[entry.user.username]['billable'] += entry.atbillablerate
        per_user[entry.user.username]['hours'] += entry.hours

        per_business.setdefault(entry.issue.project.business.name, {'ctc':0,'billable':0,'hours':0})
        per_business[entry.issue.project.business.name]['ctc'] += entry.atrate
        per_business[entry.issue.project.business.name]['billable'] += entry.atbillablerate
        per_business[entry.issue.project.business.name]['hours'] += entry.hours

        per_user_per_business.setdefault(entry.user.username, {})
        per_user_per_business[entry.user.username].setdefault(entry.issue.project.business.name, {'ctc':0,'billable':0,'hours':0})
        per_user_per_business[entry.user.username][entry.issue.project.business.name]['ctc'] += entry.atrate
        per_user_per_business[entry.user.username][entry.issue.project.business.name]['billable'] += entry.atbillablerate
        per_user_per_business[entry.user.username][entry.issue.project.business.name]['hours'] += entry.hours

    context['ctc_total'] = ctc_total
    context['billable_total'] = billable_total
    context['per_user'] = per_user
    context['per_business'] = per_business
    context['per_user_per_business'] = per_user_per_business

    context['invoices_sent'] = timepiece.Invoice.objects\
                                                .filter_by_logged_in_user(request.user)\
                                                .filter(Q(date_sent__gte=from_date)&Q(date_sent__lte=to_date))
    invoices_sent_total = 0
    for invoice in context['invoices_sent']:
        invoices_sent_total += invoice.amount
    context['invoices_sent_total'] = invoices_sent_total

    context['invoices_paid'] = timepiece.Invoice.objects\
                                                .filter_by_logged_in_user(request.user)\
                                                .filter(Q(date_sent__gte=from_date)&Q(date_sent__lte=to_date))
    invoices_paid_total = 0
    for invoice in context['invoices_paid']:
        invoices_paid_total += invoice.amount
    context['invoices_paid_total'] = invoices_paid_total

    return render(request, template, context)

@csrf_exempt
@login_required
def issue_search(request, active_project_id=None, active_business_id=None, template="timepiece/project/issue_search_results.html", context=None):
    context = context or {}

    active_project = timepiece.Project.objects.get(pk=active_project_id) if active_project_id else None
    active_business = timepiece.Business.objects.get(pk=active_business_id) if active_business_id else None
    active_issues = None
    active_sprints = None

    search_term = request.GET['search_term']
    response_mode = request.GET.get('response_mode', 'html')

    if active_project is not None:
        active_issues = timepiece.Issue.objects.filter(project__id=active_project.id).filter(Q(number__icontains=search_term)|Q(subject__icontains=search_term))
        active_issues = active_issues.order_by("project__business__name", "project__name", "subject")
        active_issues = [ x for x in active_issues if x.project.can_view_by_user(request.user) ]
        active_business = None

    elif active_business is not None:
        active_issues = timepiece.Issue.objects.filter(project__business__id=active_business.id).filter(Q(number__icontains=search_term)|Q(subject__icontains=search_term))
        active_issues = active_issues.order_by("project__business__name", "project__name", "subject")
        active_issues = [ x for x in active_issues if x.project.can_view_by_user(request.user) ]

        active_sprints = timepiece.Project.objects.filter(business__id=active_business.id).filter(Q(name__icontains=search_term)|Q(id__icontains=search_term)|Q(description__icontains=search_term))
        active_sprints = active_sprints.filter_by_logged_in_user(request.user)

    issues = timepiece.Issue.objects.filter(Q(number__icontains=search_term)|Q(subject__icontains=search_term))
    issues = issues.order_by("project__business__name", "project__name", "subject")
    issues = [ x for x in issues if x.project.can_view_by_user(request.user) ]

    sprints = timepiece.Project.objects.filter(Q(name__icontains=search_term)|Q(id__icontains=search_term)|Q(description__icontains=search_term)|Q(short_description__icontains=search_term))
    sprints = sprints.order_by("business__name", "name")
    sprints = sprints.filter_by_logged_in_user(request.user)

    businesses = timepiece.Business.objects.filter(Q(name__icontains=search_term)|Q(description__icontains=search_term))
    businesses = businesses.order_by("name")
    businesses = businesses.filter_by_logged_in_user(request.user)

    context['businesses'] = businesses
    context['sprints'] = sprints
    context['issues'] = issues
    context['active_business'] = active_business
    context['active_project'] = active_project
    context['active_issues'] = active_issues
    context['active_sprints'] = active_sprints

    if response_mode == "im_feeling_lucky":
        res = {}
        if len(issues) > 0:
            issue = issues[0]
            res['best_match'] = { 'javascript' : "imp.nav.show_issue("+str(issue.id)+", "+str(issue.project.id)+", '" + reverse('highlighted_project_list', args=[issue.project.id,issue.id]) + "' );" }
        elif len(sprints) > 0:
            sprint = sprints[0]
            res['best_match'] = { 'javascript' : "imp.nav.show_sprint("+str(sprint.id)+", '" + reverse('project_list', args=[sprint.id])+"' );" }
        elif len(businesses) > 0:
            business = businesses[0]
            res['best_match'] = { 'javascript' : "imp.nav.show_business("+str(business.id)+", '" + reverse('closed_project_list', args=[business.id])+"');" }
        return HttpResponse(json.dumps(res), content_type='application/json')

    return render(request, template, context)

@render_with('timepiece/project/show_timeline.html')
@login_required
def show_timeline(request, project_id):
    context = {}

    def _clean_subject_name(issue_subject):
        return issue_subject.replace("\n","").strip()

    project = timepiece.Project.objects.get(id=project_id)

    bp = timepiece.BusinessPermissions.for_user(request.user, project.business)
    if not bp.has_view_actual_hours:
        raise PermissionDenied

    today = datetime.datetime.today().date()
    from_date, to_date =  _get_filter_dates_only(request, context, (today - relativedelta(months=1), today))
    date_form = timepiece_forms.DateOnlyForm(request.GET)
    context['date_form'] = date_form

    entries_qs = timepiece.Entry.objects.filter(issue__project__business=project.business).order_by("start_time")
    entries_qs = _apply_date_filter(request, entries_qs, context)

    graph_data = []
    for user_id, bp in timepiece.BusinessPermissions.by_user(project.business).items():
        graph_user_data = { 'user': User.objects.get(pk=user_id),
                            'entries': entries_qs.filter(user_id=user_id) }
        graph_data.append(graph_user_data)
    context['from_date'] = from_date
    context['to_date'] = to_date
    context['graph_data'] = graph_data
    context['project'] = project

    # for issue in project.issues.all():
    #     issue_entries = issue.related_entries

    #     if len(issue_entries) == 0:
    #         continue

    #     issue_subject = _clean_subject_name(issue.subject)
    #     issuedict[issue_subject] = issuedict.get(issue_subject,{})
    #     for entry in issue_entries:
    #         issue_total_hours_for_day = issuedict[issue_subject].get(entry.start_time,0)
    #         issuedict[issue_subject][entry.start_time.date()] = issue_total_hours_for_day +  float(entry.hours)

    #         if mindate is None or mindate > entry.start_time:
    #              mindate = entry.start_time

    #         if maxdate is None or maxdate < entry.end_time:
    #              maxdate = entry.end_time


    # day_biggest_issue_dict  = {}
    # day_dict = {}
    # for issue in project.issues.all():
    #     issue_entries = issue.related_entries
    #     issue_subject = _clean_subject_name(issue.subject)
    #     if len(issue_entries) == 0:
    #         continue

    #     for entry in issue_entries:
    #         day_dict[entry.start_time] = day_dict.get(entry.start_time,{})
    #         day_dict[entry.start_time][issue_subject] = day_dict[entry.start_time].get(issue_subject,0) +  float(entry.hours)

    # for day_start, daily_issue_info in sorted(day_dict.iteritems()):
    #     cur_max = 0
    #     for issue, duration in daily_issue_info.iteritems():
    #         if duration > cur_max:
    #             day_biggest_issue_dict[day_start] = issue
    #             cur_max = duration


    # context['issue_entry'] = []
    # for issue_subject,day_entry in  sorted(issuedict.items()):
    #     sorted_day_entry_items = sorted(day_entry.iteritems())
    #     element = [ issue_subject, sorted_day_entry_items ]
    #     max_elem = None
    #     for item in sorted_day_entry_items:
    #         if not max_elem or max_elem[-1] < item[-1]:
    #             max_elem = item
    #     if max_elem is not None:
    #         element.append(max_elem)
    #     context['issue_entry'].append(element)

    # offset = datetime.timedelta(hours=24)
    # context['issue_labels'] = [ (day-offset,name) for day, name in sorted(day_biggest_issue_dict.iteritems())]
    # context['from_date'] = mindate
    # context['to_date'] = maxdate

    return context


@login_required
@render_with('timepiece/project/show_permissions.html')
def show_permissions(request, business_id):

    context = {}
    try:
        business = timepiece.Business.objects.get(pk=business_id)
    except timepiece.Business.DoesNotExist:
        business = None

    add_user_form = timepiece_forms.AddUserToProjectForm()

    context['add_user_form']= add_user_form

    context['business'] = business

    users = [] if business is None else business.users

    permissions_set = business.get_all_business_permissions()
    permissions_set = permissions_set.order_by("user__username")
    permission_forms = timepiece_forms.permissions_formset(request.POST or None,
                                                            queryset = permissions_set)



    if permission_forms.is_valid():
        has_edit_permissions = timepiece.BusinessPermissions.objects.get_or_create(business=business, user=request.user)[0].has_edit_permissions
        if not has_edit_permissions:
            raise PermissionDenied

        permission_forms.save()
        return HttpResponseRedirect(reverse('show_permissions', args=[business_id]))

    context['permission_forms'] = permission_forms

    context['permission_user_list'] = users

    context['last_project'] = timepiece.Project.most_recent_project(business.id)

    context['current_user']= request.user
    context['business_permissions_by_user'] = timepiece.BusinessPermissions.by_user(business)
    return context


@csrf_exempt
@login_required
def get_project_row(request,project_id, context= None):
    context = context or {}

    project  = timepiece.Project.objects.get(pk = project_id)

    context['project'] = project
    r = render(request, 'timepiece/project/_project_list_item.html',
                           context)
    return r

@csrf_exempt
@login_required
def show_issue(request, issue_id, context=None):
    issue = timepiece.Issue.objects.get(pk=issue_id)
    if not issue.project.can_view_by_user(request.user):
        raise PermissionDenied
    return reverse('highlighted_project_list', args=[issue.project.id, issue.id])

@csrf_exempt
@login_required
def get_issue_row(request,issue_id):
    context = {}

    queryset = timepiece.Issue.objects.filter(pk=issue_id)
    project = queryset[0].project
    business = project.business

    issue = queryset[0].set_order()
    users_allowed_to_estimate_on_business=business.get_users_allowed_to_estimate_on_business(request.user)
    _augment_issue_data(issue,request.user,
                        users_allowed_to_estimate_on_business=users_allowed_to_estimate_on_business)

    new_issue_form = timepiece_forms.IssueForm()

    rate = project.get_user_rate(request.user)
    context['current_user_rate'] = float(rate.amount) if rate else 0.0
    context['business'] = business
    context['new_issue_form'] = new_issue_form
    context['current_user'] = request.user
    context['project'] = project
    context['business_permissions_by_user'] = timepiece.BusinessPermissions.by_user(business)
    context['users_with_time_but_no_estimates_in_this_project'] = project.get_users_with_time_but_no_estimates_in_this_project()
    context['assign_user_form'] = timepiece_forms.AssignUserToIssueForm()
    refresh_issue =timepiece.Issue.objects.get(id=issue.id)
    refresh_issue.representation = issue.representation
    context['issue'] = refresh_issue
    r = render(request, 'timepiece/project/_issue_entry_row.html',
                           context)

    return r

@csrf_exempt
@login_required
def add_issue_comment(request, issue_id):
    issue = timepiece.Issue.objects.get(pk=issue_id)
    business = issue.project.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)

    if not bp.has_add_issue_comment:
        raise PermissionDenied

    text = request.POST['comment']
    new_comment = timepiece.IssueComment.objects.create(
        comment=text,
        issue=issue,
        author=request.user,
        created=datetime.datetime.today())
    timepiece.IssueHistory.add_history(request.user, issue, "added comment %s"%new_comment.id, "", new_comment.comment)

    get_interface_plugin(request, business).add_issue_comment(new_comment)

    return HttpResponse("ok")

@csrf_exempt
@login_required
def edit_issue_comment(request, comment_id):
    comment = timepiece.IssueComment.objects.get(pk=comment_id)
    issue = comment.issue
    business = issue.project.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)

    if not bp.has_add_issue_comment:
        raise PermissionDenied

    text = request.POST['comment']
    old_comment = comment.comment
    comment.comment = text
    comment.author = request.user
    comment.modified = datetime.datetime.today()
    comment.save()

    get_interface_plugin(request, business).edit_issue_comment(comment)
    timepiece.IssueHistory.add_history(request.user, issue, "edited comment %s"%comment.id, old_comment, comment.comment)
    return HttpResponse("ok")

@csrf_exempt
@login_required
def delete_issue_comment(request, comment_id):
    comment = timepiece.IssueComment.objects.get(pk=comment_id)
    issue = comment.issue
    business = issue.project.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)

    if not bp.has_add_issue_comment:
        raise PermissionDenied

    old_comment_text = comment.comment
    old_comment_id = comment.id
    comment.delete()

    get_interface_plugin(request, business).delete_issue_comment(comment)
    timepiece.IssueHistory.add_history(request.user, issue, "deleted comment %s"%old_comment_id, old_comment_text, "")
    return HttpResponse("ok")

@csrf_exempt
@login_required
def add_issue_testable(request, issue_id):
    issue = timepiece.Issue.objects.get(pk=issue_id)
    business = issue.project.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)

    if not bp.has_edit_description:
        raise PermissionDenied

    text = request.POST['testable']
    testables = issue.testables.all().order_by('order').values_list('order', flat=True)
    max_order = 0
    if testables:
        max_order = max(testables)

    new_testable = Testable.objects.create(
        steps=text,
        issue=issue,
        order=max_order+1)

    timepiece.IssueHistory.add_history(
        request.user, issue, "added testable %s"%new_testable.id, "", new_testable.steps)
    get_interface_plugin(request, business).add_testable(new_testable)

    return HttpResponse("ok")

@csrf_exempt
@login_required
def edit_issue_testable(request, testable_id):
    testable = Testable.objects.get(pk=testable_id)
    issue = testable.issue
    business = issue.project.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)

    if not bp.has_edit_description:
        raise PermissionDenied

    text = request.POST['testable']
    old_testable = testable.steps
    testable.steps = text
    testable.save()

    get_interface_plugin(request, business).edit_testable(testable)
    timepiece.IssueHistory.add_history(request.user, issue, "edited testable %s"%testable.id, old_testable, testable.steps)
    return HttpResponse("ok")

@csrf_exempt
@login_required
def delete_issue_testable(request, testable_id):
    testable = Testable.objects.get(pk=testable_id)
    issue = testable.issue
    business = issue.project.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)

    if not bp.has_edit_description:
        raise PermissionDenied

    old_testable_text = testable.steps
    old_testable_id = testable.id
    testable.delete()

    get_interface_plugin(request, business).delete_testable(testable)
    timepiece.IssueHistory.add_history(request.user, issue, "deleted testable %s"%old_testable_id, old_testable_text, "")
    return HttpResponse("ok")

@csrf_exempt
@login_required
def add_issue_attachment(request, issue_id):

    issue = timepiece.Issue.objects.get(pk=issue_id)
    business = issue.project.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)

    if not bp.has_edit_description:
        raise PermissionDenied

    f = request.FILES['attachment']
    timepiece.IssueAttachment.objects.create(issue=issue, attachment=f, name=f.name)
    timepiece.IssueHistory.add_history(request.user, issue, "added attachment", "", f.name)
    return HttpResponse("ok")

@csrf_exempt
@login_required
def delete_issue_attachment(request, attachment_id):
    attachment = timepiece.IssueAttachment.objects.get(pk=attachment_id)
    issue = attachment.issue
    business = issue.project.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not bp.has_edit_description:
        raise PermissionDenied

    attachment.delete()
    timepiece.IssueHistory.add_history(request.user, issue, "deleted attachment", attachment.name, "")
    return HttpResponse("ok")

@csrf_exempt
@login_required
def sortable_issue_update(request, project_id, context=None):
    context = context or {}

    ordered_issue_ids = []
    for index in request.POST['ordered_ids'].split(","):
        try:
            int_index = int(index)
            if int_index > 0:
                ordered_issue_ids.append(int_index)
        except ValueError:
            continue

    new_project_id = request.POST['project_id']

    timepiece.Issue.objects.filter(pk__in=ordered_issue_ids).update(project_id=new_project_id)
    timepiece.ProjectIssueOrder.order_like_this(project_id=new_project_id, ordered_issue_ids=ordered_issue_ids)
    return HttpResponse("")

@csrf_exempt
@login_required
def sortable_project_update(request):
    ordered_project_ids = []
    for index in request.POST['ordered_ids'].split(","):
        try:
            int_index = int(index)
            if int_index > 0:
                ordered_project_ids.append(int_index)
        except ValueError:
            continue

    first_project = timepiece.Project.objects.get(id=ordered_project_ids[0])

    timepiece.BusinessProjectOrder.order_like_this(business_id=first_project.business_id,
                                                   ordered_project_ids=ordered_project_ids)
    return HttpResponse("")


def sprint_export(request, project_id , context=None):
    context = context or {}
    exporter = CSVSprintExport(project_id, request)
    return exporter.render_to_response(context)

def sprint_report_settings(request, project_id, context=None):
    context = context or {}
    project = timepiece.Project.objects.get(pk=project_id)
    business = project.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not bp.has_view_project_card:
        return HttpResponse("Sorry, you don't have permission to view the report")

    if 'only_these_issues' in request.GET and request.GET['only_these_issues']:
        only_these_issues = [ timepiece.Issue.objects.get(pk=issue_id) for issue_id in request.GET['only_these_issues'].split(",") if issue_id ]
    else:
        only_these_issues = None
    context['quote_form'] = timepiece_forms.SprintQuoteReportSettingsForm(project, bp, only_these_issues)
    context['invoice_form'] = timepiece_forms.SprintInvoiceReportSettingsForm(project, bp, only_these_issues)
    context['project'] = project
    return render(request, 'timepiece/project/sprint_report_settings.html',
                              context)

@csrf_exempt
def sprint_report(request, project_id, context=None):

    try:
        if request.POST:
            DATA = request.POST.copy()
        else:
            DATA = request.GET.copy()
        if 'authenticate_token' in DATA and 'authenticate_username' in DATA:

            def override_login(request, user):
                if not hasattr(user, 'backend'):
                    for backend in settings.AUTHENTICATION_BACKENDS:
                        if user == load_backend(backend).get_user(user.pk):
                            user.backend = backend
                            break
                if hasattr(user, 'backend'):
                    return django_login(request, user)

            authenticate_token = DATA['authenticate_token']
            username = DATA['authenticate_username']
            try:
                user = timepiece.UserProfile.objects.get(authenticate_token=authenticate_token, user__username=username).user
                override_login(request, user)
            except timepiece.UserProfile.DoesNotExist:
                pass
            except Exception:
                return HttpResponse("Not authenticated")
        else:
            user = request.user

        context = context or {}
        context['annotation_size'] = settings.QUOTE_ANNOTATION_SIZE
        project = timepiece.Project.objects.get(pk=project_id)

        if 'output_format' in DATA and DATA['output_format'] == "pdf" and 'HTTP_REFERER' in request.META:
            url = request.build_absolute_uri(reverse('sprint_report', kwargs={'project_id':project.id}))
            #url = "%s&output_format=pdf&authenticate_token=%s&authenticate_username=%s&%s" % (request.META['HTTP_REFERER'], user.profile.authenticate_token, user.username, url_params)

            prefix = DATA['report_type']
            if DATA['report_type'] == 'Quote':
                prefix = "Proposal"
            filename = prefix + "_implicitdesign_" + project.long_name().replace(" ","") + "_" + datetime.datetime.today().strftime("%d%m%Y") + ".pdf"

            try:
                url = create_url_from_query_dict(url, qd=DATA)
                transaction.commit()
                response = render_url_to_pdf(url, request, basename=filename)
            except Exception, ex:
                logger.exception(ex)
                logger.error("Failed to create pdf using url: %s : %s" % (url, ex))
                raise


            #response = HttpResponse(as_pdf, content_type='application/pdf')
            #response['Content-Disposition'] = 'attachment; filename="%s"' % filename

            if DATA['report_type'] == 'Quote':
                doc_type = 'quote'
            elif DATA['report_type'] == 'Invoice':
                doc_type = 'invoice'
            else:
                doc_type = 'other'

            f = ContentFile(response.content)
            document = timepiece.BusinessDocument.objects.create(project=project,
                                                                 business=project.business,
                                                                 filename=filename,
                                                                 doc_type=doc_type,
                                                                 mime_type='application/pdf',
                                                                 comments='auto created\n%s'%url.replace("authenticate_token","xx"),
                                                                 modified_by_id=request.user.id,
                                                                 created_by_id=request.user.id)
            document.doc.save(filename, f)

            return response

        business = project.business
        issues = project.issues.order_by_project_id(project.id)

        bp = timepiece.BusinessPermissions.for_user(user, business)
        quote_form = timepiece_forms.SprintQuoteReportSettingsForm(project, bp, issues, DATA)
        invoice_form = timepiece_forms.SprintInvoiceReportSettingsForm(project, bp, issues, DATA)

        if not DATA.get('report_type', None):
            return HttpResponse("No permission to generate quotes or invalid POST")

        if DATA['report_type'] == 'Quote' and quote_form.is_valid():
            if not bp.has_view_ctc_billable_rates:
                return HttpResponse("No permission to generate quotes")

            form = quote_form
            template = 'timepiece/project/sprint_quote_report.html'

        elif (DATA['report_type'] == 'Invoice' or DATA['report_type'] == 'Summary') and invoice_form.is_valid():
            form = invoice_form
            template = 'timepiece/project/sprint_invoice_report.html'
        else:
            raise Exception("Unknown report type or invalid params: %s %s %s" % (DATA['report_type'], str(invoice_form.errors), str(quote_form.errors)))

        if form.is_valid():
            context['settings'] = form.cleaned_data

            if 'only_these_statuses' in form.cleaned_data:
                statuses = form.cleaned_data['only_these_statuses']
                if 'all' not in statuses:
                    issues = issues.filter(status2__name__in=statuses)

            if 'only_assigned_to' in form.cleaned_data:
                assigned_to = form.cleaned_data['only_assigned_to']
                if 'all' not in assigned_to:
                    issues = issues.filter(assigned_to__username__in=assigned_to)

            if 'only_these_issue_numbers' in form.cleaned_data:
                issues = issues.filter(number__in=form.cleaned_data['only_these_issue_numbers'])

            if not form.cleaned_data.get('include_adhoc_issues', False):
                issues = issues.exclude(issue_type='adhoc')

        if form == quote_form:
            context['estimate_stats'] = project.estimate_stats(issues, preferred_user_id=form.cleaned_data['preferred_user_for_estimates'])
        context['issues'] = issues
        context['form'] = form
        context['project'] = project

        if 'start' in context['settings']:
            stats = project.cache_stats(start=context['settings']['start'], end=context['settings']['end'], issues=context['issues'])
            context['issues'] = stats['issues_with_time_entries']

        if 'output_format' in DATA and DATA['output_format'] == 'pdf':
            context['output_format'] = 'pdf'
        else:
            context['output_format'] = 'html'

        context['user'] = user
        context['date_created'] = datetime.datetime.now().strftime("%d %b %Y %H:%M")
        project.calculate_new_stats(request.user)

        most_recent_quote_document = timepiece.BusinessDocument.objects.filter(project=project).order_by("-id").first()
        new_quote_default_args = { 'status': 'sent to client',
                                   'project': project.id,
                                   'internal_comment': 'Created by %s' % request.user,
                                   'amount': int(project.new_stats['total']['hours_billable_with_scope_creep'] or 0),
                                   'quote_document': most_recent_quote_document.id if most_recent_quote_document else None,
                                   'currency_symbol': 'R'}
        context['url_capture_quote'] = reverse('invoicing:new_quote') + "?" + urllib.urlencode(new_quote_default_args)
        context['report_type'] = DATA['report_type']

    except Exception, ex:
        logger.exception(ex)
        raise

    return render(request, template, context)

@login_required
def edit_issue_number(request, issue_id, context=None):
    context = context or {}
    if not request.user.is_superuser:
        return HttpResponseForbidden("Not allowed")
    issue = timepiece.Issue.objects.get(pk=issue_id)
    old_number = issue.number

    form = timepiece_forms.IssueNumberForm(request.POST or None, instance=issue)
    if form.is_valid():
        form.save()
        timepiece.IssueHistory.add_history(request.user, issue, "issue number", old_number, issue.number)
        return HttpResponse(issue.number)
    return Http404("Couldn't not edit issue number : %s", form.errors)

@login_required
def show_issue_history(request, issue_id, template="timepiece/project/issue_history.html", context=None):
    context = context or {}
    issue = timepiece.Issue.objects.get(pk=issue_id)
    project = issue.project
    business = project.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not bp.has_edit_project_detail:
        return HttpResponse("Sorry, you don't have permission to view the issue")

    context['issue'] = issue
    context['history'] = timepiece.IssueHistory.for_issue(issue)
    return render(request, template, context)

@login_required
def view_business_documents(request, business_id, template="timepiece/project/business_documents.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not bp.has_view_documents:
        return HttpResponse("Sorry, you don't have permission to view business documents")

    form = timepiece_forms.NewBusinessDocumentForm(request.POST or None, request.FILES or None)
    if form.is_valid():
        document = form.save(commit=False)
        document.business = business
        document.created_by_id = request.user.id
        document.modified_by_id = request.user.id
        document.mime_type = form.cleaned_data['doc'].content_type
        document.filename = form.cleaned_data['doc'].name
        document.save()
        form.save_m2m()
        messages.info(request, "Document %s uploaded" % document.filename)
        return HttpResponseRedirect(reverse('view_business_documents', args=[business_id]))

    context['new_doc_form'] = form
    context['generate_doc_form'] = timepiece_forms.GenerateBusinessDocumentForm(request.POST or None)
    context['business'] = business
    context['documents'] = business.documents.all().filter(deleted=False).order_by("-created_at")
    return render(request, template, context)

@login_required
def download_business_document(request, document_token, template="timepiece/project/business_documents.html", context=None):
    context = context or {}
    document = timepiece.BusinessDocument.objects.get(token=document_token)
    business = document.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not bp.has_view_documents:
        return HttpResponse("Sorry, you don't have permission to view this business document")

    context['business'] = business
    context['documents'] = business.documents.all().order_by("-created_at")

    response = download_media(request, document.doc.name,
                              content_type=document.mime_type)
    #response = HttpResponse(document.doc, content_type=document.mime_type)
    response['Content-Disposition'] = 'attachment; filename="%s"' % document.filename
    return response

@login_required
def edit_business_document(request, document_token, template="timepiece/project/edit_business_document.html", context=None):
    context = context or {}
    document = timepiece.BusinessDocument.objects.get(token=document_token)
    business = document.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not bp.has_view_documents:
        return HttpResponse("Sorry, you don't have permission to view this business document")

    form = timepiece_forms.EditBusinessDocumentForm(request.POST or None, instance=document)
    if form.is_valid():
        document = form.save(commit=False)
        document.modified_by = request.user
        document.save()
        form.save_m2m()
        messages.info(request, "Document %s edited" % document.filename)
        return HttpResponseRedirect(reverse('view_business_documents', args=[business.id]))

    context['form'] = form
    context['document'] = document
    return render(request, template, context)

@login_required
def delete_business_document(request, document_token, template="timepiece/project/business_documents.html", context=None):
    context = context or {}
    document = timepiece.BusinessDocument.objects.get(token=document_token)
    business = document.business
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not bp.has_view_documents:
        return HttpResponse("Sorry, you don't have permission to view this business document")

    filename = document.filename
    document.deleted = True
    document.save()
    messages.info(request, "Document %s deleted" % filename)
    return HttpResponseRedirect(reverse('view_business_documents', args=[business.id]))

@csrf_exempt
def generate_preview_business_document(request, business_id, template="timepiece/project/generate_business_document_preview.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)

    user = request.user
    if 'authenticate_token' in request.GET and 'authenticate_username' in request.GET:
        def override_login(request, user):
            if not hasattr(user, 'backend'):
                for backend in settings.AUTHENTICATION_BACKENDS:
                    if user == load_backend(backend).get_user(user.pk):
                        user.backend = backend
                        break
            if hasattr(user, 'backend'):
                return django_login(request, user)

        authenticate_token = request.GET['authenticate_token']
        username = request.GET['authenticate_username']
        try:
            user = timepiece.UserProfile.objects.get(authenticate_token=authenticate_token, user__username=username).user
            override_login(request, user)
        except timepiece.UserProfile.DoesNotExist:
            pass
        except Exception:
            return HttpResponse("Not authenticated")

    bp = timepiece.BusinessPermissions.for_user(user, business)
    if not bp.has_view_documents:
        return HttpResponse("Sorry, you don't have permission to create business documents")

    # def markup(content):
    #     # content = re.sub(r"\*\*\*\*(.*)", r"<h4>\1</h4>", content)
    #     # content = re.sub(r"\*\*\*(.*)", r"<h3>\1</h3>", content)
    #     content = re.sub(r"\*\*(.*)", r"<h2>\1</h2>", content)
    #     content = re.sub(r"\*(.*)", r"<h3>\1</h3>", content)
    #     return content

    form = timepiece_forms.GenerateBusinessDocumentForm(request.POST or request.GET or None)
    if form.is_valid():
        original_content = form.cleaned_data['content']
        content = markdown.markdown(original_content, extensions=['tables'])
        context['pages'] = content.split("\pagebreak")
        context['title'] = form.cleaned_data['title']

        if 'render_mode' in request.POST and request.POST['render_mode'] == 'generate' and 'HTTP_REFERER' in request.META:
            url = (request.META['HTTP_REFERER'])

            post_data = {}
            post_data.update(form.cleaned_data)
            post_data['output_format'] = 'pdf'
            post_data['authenticate_token'] = request.user.profile.authenticate_token
            post_data['authenticate_username'] = request.user.username
            url = url+"?"+urllib.urlencode(post_data)
            filename = form.cleaned_data['filename'] + "_" + datetime.datetime.today().strftime("%d%m%Y") + ".pdf"
            transaction.commit()
            response = render_url_to_pdf(url, request, basename=filename)

            #response = HttpResponse(as_pdf, content_type='application/pdf')
            #response['Content-Disposition'] = 'attachment; filename="%s"' % filename

            f = ContentFile(response.content)
            document = timepiece.BusinessDocument.objects.create(business=business,
                                                                 filename=filename,
                                                                 doc_type=form.cleaned_data['doc_type'],
                                                                 mime_type='application/pdf',
                                                                 comments='auto created\n%s'%url.replace("authenticate_token","xx"),
                                                                 original_content=original_content,
                                                                 created_by_id=request.user.id,
                                                                 modified_by_id=request.user.id)
            document.doc.save(filename, f)

            return response

    context['form'] = form
    context['business'] = business
    context['date_created'] = datetime.datetime.now()

    if 'output_format' in request.GET:
        context['output_format'] = request.GET['output_format']
    else:
        context['output_format'] = 'html'
    return render(request, template, context)

@login_required
def generate_business_document(request, business_id, context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not bp.has_view_documents:
        return HttpResponse("Sorry, you don't have permission to create business documents")

    form = timepiece_forms.GenerateBusinessDocumentForm(request.POST or None)
    if form.is_valid():
        document = form.save(commit=False)
        document.business = business
        document.modified_by_id = request.user.id
        document.created_by_id = request.user.id
        document.mime_type = form.cleaned_data['doc'].content_type
        document.filename = form.cleaned_data['doc'].name
        document.save()
        form.save_m2m()
        messages.info(request, "Document %s uploaded" % document.filename)

    return view_business_documents(request, business_id)

@login_required
def issue_checkbox_context_menu(request, project_id, template="timepiece/project/issue_checkbox_context_menu.html", context=None):
    context = context or {}

    raw_checked_issue_numbers = request.GET['checked_issue_numbers'].strip()
    if len(raw_checked_issue_numbers) == 0:
        raw_checked_issue_numbers = ""
    checked_issue_ids = [x for x in raw_checked_issue_numbers.split(",") if len(x.strip())>0]

    from_project = timepiece.Project.objects.get(pk=project_id)
    bp = timepiece.BusinessPermissions.for_user(request.user, from_project.business)
    if not bp.has_add_issue:
        return HttpResponse("No permission")

    other_projects = [p for p in timepiece.Project.objects.filter(business=from_project.business).exclude(pk=from_project.id) if p.is_open]
    context['other_projects'] = other_projects

    context['issues'] = checked_issue_ids
    context['num_issues'] = len(checked_issue_ids)
    context['project'] = from_project

    context['state_select_form'] = timepiece_forms.IssueCheckboxContextMenuSelectByStateForm(from_project)
    context['state_change_form'] = timepiece_forms.IssueCheckboxContextMenuChangeStateForm(from_project)
    context['assignee_change_form'] = timepiece_forms.IssueCheckboxContextMenuChangeAssigneeForm(from_project)
    context['move_above_issue_form'] = timepiece_forms.IssueCheckboxContextMenuActiveIssueForm(from_project, "Move above")
    context['move_below_issue_form'] = timepiece_forms.IssueCheckboxContextMenuActiveIssueForm(from_project, "Move below")
    context['bulk_change_issue_adhoc_form'] = timepiece_forms.IssueCheckboxContextMenuChangeIssueAdhocForm(from_project, "Change adhoc")

    # easier to store the issue ids than to pass them through with every context menu option
    request.session['selected_issue_ids_for_context_menu'] = checked_issue_ids
    request.session['selected_issue_project_id'] = from_project.id

    return render(request, template, context)

@csrf_exempt
@login_required
def move_issue_to_project(request):
    issue_id = request.POST['issue_id'];
    dest_project_id = request.POST['dest_project_id']

    dest_project = timepiece.Project.objects.get(pk=dest_project_id)

    bp = timepiece.BusinessPermissions.for_user(request.user, dest_project.business)
    if not bp.has_edit_issues:
        return HttpResponse(json.dumps({ "status": "No permission" }))

    issue = timepiece.Issue.objects.get(pk=issue_id)

    old_project = issue.project
    bp = timepiece.BusinessPermissions.for_user(request.user, old_project.business)
    if not bp.has_edit_issues:
        return HttpResponse(json.dumps({ "status": "No permission" }))

    issue.project = dest_project
    issue.save()
    timepiece.ProjectIssueOrder.insert_at_the_end(issue)

    timepiece.IssueHistory.add_history(request.user, issue, "moved project", unicode(old_project), unicode(dest_project))
    get_interface_plugin(request, dest_project.business).move_issue(issue, old_project=old_project)
    return HttpResponse(json.dumps({ "status" : "ok" }))

@login_required
def bulk_move_issues_to_project(request, dest_project_id, context=None):
    selected_issue_ids = request.session['selected_issue_ids_for_context_menu']

    dest_project = timepiece.Project.objects.get(pk=dest_project_id)

    bp = timepiece.BusinessPermissions.for_user(request.user, dest_project.business)
    if not bp.has_edit_issues:
        return HttpResponse("No permission")

    for selected_issue_id in selected_issue_ids:
        issue = timepiece.Issue.objects.get(pk=selected_issue_id)
        old_project = issue.project
        issue.project = dest_project
        issue.save()
        timepiece.ProjectIssueOrder.insert_at_the_end(issue)
        timepiece.IssueHistory.add_history(request.user, issue, "moved project", unicode(old_project), unicode(dest_project))
        get_interface_plugin(request, dest_project.business).move_issue(issue, old_project=old_project)

    messages.info(request, "%d issues moved to %s" % (len(selected_issue_ids), dest_project))

    return HttpResponseRedirect(reverse('project_list', args=[dest_project.id]))


@login_required
@csrf_exempt
def bulk_change_issue_state(request, context=None):
    selected_issue_ids = request.session['selected_issue_ids_for_context_menu']
    selected_project = timepiece.Project.objects.get(pk=request.session['selected_issue_project_id'])

    form = timepiece_forms.IssueCheckboxContextMenuChangeStateForm(selected_project, request.GET or None)
    if not form.is_valid():
        return HttpResponse("No state chosen: %s" % form.errors)

    bp = timepiece.BusinessPermissions.for_user(request.user, selected_project.business)
    if not bp.has_edit_issue_states:
        return HttpResponse("No permission")

    if not form.cleaned_data['status']:
        new_status = None
    else:
        new_status = timepiece.IssueStatus.objects.get_or_create(pk=form.cleaned_data['status'], business=selected_project.business)[0]
    for selected_issue_id in selected_issue_ids:
        issue = timepiece.Issue.objects.get(pk=selected_issue_id)
        if not issue.status2 or new_status != issue.status2.name:
            old_status = issue.status2.name if issue.status2 else None
            issue.status2 = new_status
            issue.save()
            timepiece.IssueHistory.add_history(request.user, issue, "changed status", old_status, new_status)
            get_interface_plugin(request, selected_project.business).update_issue_status(issue)

    messages.info(request, "%d issues changed state to %s" % (len(selected_issue_ids), new_status))
    return HttpResponseRedirect(reverse('project_list', args=[selected_project.id]))

@login_required
@csrf_exempt
def bulk_change_issue_assignee(request, context=None):
    selected_issue_ids = request.session['selected_issue_ids_for_context_menu']
    selected_project = timepiece.Project.objects.get(pk=request.session['selected_issue_project_id'])

    form = timepiece_forms.IssueCheckboxContextMenuChangeAssigneeForm(selected_project, request.GET or None)
    if not form.is_valid():
        return HttpResponse("No assignee chosen: %s" % form.errors)

    bp = timepiece.BusinessPermissions.for_user(request.user, selected_project.business)
    if not bp.has_assign_user:
        return HttpResponse("No permission")

    new_assignee = auth_models.User.objects.get(pk=form.cleaned_data['assignee'])
    for selected_issue_id in selected_issue_ids:
        issue = timepiece.Issue.objects.get(pk=selected_issue_id)
        if new_assignee != issue.assigned_to:
            old_assignee = issue.assigned_to
            issue.assigned_to = new_assignee
            issue.save()
            timepiece.IssueHistory.add_history(request.user, issue, "changed assigned user", old_assignee, new_assignee)
    messages.info(request, "%d issues changed assigned user to %s" % (len(selected_issue_ids), new_assignee))
    return HttpResponseRedirect(reverse('project_list', args=[selected_project.id]))

@login_required
@csrf_exempt
def bulk_delete_issues(request, context=None):
    selected_issue_ids = request.session['selected_issue_ids_for_context_menu']
    selected_project = timepiece.Project.objects.get(pk=request.session['selected_issue_project_id'])

    bp = timepiece.BusinessPermissions.for_user(request.user, selected_project.business)
    if not bp.has_delete_issue:
        return HttpResponse("No permission")

    for selected_issue_id in selected_issue_ids:
        issue = timepiece.Issue.objects.get(pk=selected_issue_id)
        timepiece.IssueHistory.add_history(request.user, issue, "deleted", issue.id, "")
        issue.delete()

    messages.info(request, "%d issues deleted" % (len(selected_issue_ids)))
    return HttpResponseRedirect(reverse('project_list', args=[selected_project.id]))

@login_required
@csrf_exempt
def bulk_move_issue_above_issue(request, context=None):
    selected_issue_ids = request.session['selected_issue_ids_for_context_menu']
    selected_project = timepiece.Project.objects.get(pk=request.session['selected_issue_project_id'])

    bp = timepiece.BusinessPermissions.for_user(request.user, selected_project.business)
    if not bp.has_edit_issues:
        return HttpResponse("No permission")

    form = timepiece_forms.IssueCheckboxContextMenuActiveIssueForm(selected_project, "", request.GET or None)
    if not form.is_valid():
        return HttpResponse("No issue chosen: %s" % form.errors)
    focus_issue = timepiece.Issue.objects.filter(project=selected_project).get(pk=form.cleaned_data['focus_issue'])

    issues = selected_project.issues.all().filter(pk__in=selected_issue_ids)
    selected_issues = issues.order_by_project_id(selected_project.id)
    num_moved = 0
    running_issue = focus_issue
    for index, issue in enumerate(selected_issues):
        num_moved += 1
        timepiece.ProjectIssueOrder.insert_before(issue=issue, set_before_this_issue=running_issue)
        running_issue = issue

    messages.info(request, "%d issues moved above %s %s" % (num_moved, focus_issue.number, focus_issue.subject))
    return HttpResponseRedirect(reverse('project_list', args=[selected_project.id]))

@login_required
@csrf_exempt
def bulk_move_issue_below_issue(request, context=None):
    selected_issue_ids = request.session['selected_issue_ids_for_context_menu']
    selected_project = timepiece.Project.objects.get(pk=request.session['selected_issue_project_id'])

    bp = timepiece.BusinessPermissions.for_user(request.user, selected_project.business)
    if not bp.has_edit_issues:
        return HttpResponse("No permission")

    form = timepiece_forms.IssueCheckboxContextMenuActiveIssueForm(selected_project, "", request.GET or None)
    if not form.is_valid():
        return HttpResponse("No issue chosen: %s" % form.errors)
    focus_issue = timepiece.Issue.objects.filter(project=selected_project).get(pk=form.cleaned_data['focus_issue'])

    issues = selected_project.issues.all().filter(pk__in=selected_issue_ids)
    selected_issues = issues.order_by_project_id(selected_project.id)
    num_moved = 0
    running_issue = focus_issue
    for index, issue in enumerate(selected_issues):
        num_moved += 1
        timepiece.ProjectIssueOrder.insert_after(issue=issue, set_after_this_issue=running_issue)
        running_issue = issue

    messages.info(request, "%d issues moved below %s %s" % (num_moved, focus_issue.number, focus_issue.subject))
    return HttpResponseRedirect(reverse('project_list', args=[selected_project.id]))

@login_required
@csrf_exempt
def bulk_clear_selected_issues(request, context=None):
    del request.session['selected_issue_ids_for_context_menu']
    selected_project = timepiece.Project.objects.get(pk=request.session['selected_issue_project_id'])
    return HttpResponseRedirect(reverse('project_list', args=[selected_project.id]))

@login_required
@csrf_exempt
def bulk_select_issues_for_project(request, project_id, context=None):
    selected_project = timepiece.Project.objects.get(pk=project_id)
    request.session['selected_issue_project_id'] = selected_project.id

    if 'selected_issue_ids_for_context_menu' in request.session:
        del request.session['selected_issue_ids_for_context_menu']

    selected_issues = selected_project.issues.all()
    request.session['selected_issue_ids_for_context_menu'] = [x.id for x in selected_issues]
    messages.info(request, "%d issues selected" % (selected_issues.count()))
    return HttpResponseRedirect(reverse('project_list', args=[selected_project.id]))

@login_required
@csrf_exempt
def bulk_select_by_issue_state(request, project_id, context=None):
    selected_project = timepiece.Project.objects.get(pk=project_id)
    request.session['selected_issue_project_id'] = selected_project.id

    if 'selected_issue_ids_for_context_menu' in request.session:
        del request.session['selected_issue_ids_for_context_menu']

    form = timepiece_forms.IssueCheckboxContextMenuSelectByStateForm(selected_project, request.GET or None)

    if form.is_valid():
        state_id = form.cleaned_data['status']
        state_to_select = timepiece.IssueStatus.objects.get(pk=state_id, business_id=selected_project.business_id)
        selected_issues = selected_project.issues.filter(status2=state_to_select)
        request.session['selected_issue_ids_for_context_menu'] = [x.id for x in selected_issues]
        messages.info(request, "%d issues selected for state %s" % (selected_issues.count(), state_to_select.name))
    else:
        messages.info(request, "Failure: %s" % form.errors)
    return HttpResponseRedirect(reverse('project_list', args=[selected_project.id]))

@login_required
@csrf_exempt
def bulk_change_issue_adhoc(request, context=None):
    selected_issue_ids = request.session['selected_issue_ids_for_context_menu']
    selected_project = timepiece.Project.objects.get(pk=request.session['selected_issue_project_id'])

    form = timepiece_forms.IssueCheckboxContextMenuChangeIssueAdhocForm(selected_project, "Adhoc", request.GET or None)
    if not form.is_valid():
        return HttpResponse("Please choose a valid option: %s" % form.errors)

    bp = timepiece.BusinessPermissions.for_user(request.user, selected_project.business)
    if not bp.has_add_issue:
        return HttpResponse("No permission")

    new_adhoc = (form.cleaned_data['adhoc'] == 'set_adhoc')
    for selected_issue_id in selected_issue_ids:
        issue = timepiece.Issue.objects.get(pk=selected_issue_id)
        if new_adhoc != issue.issue_type:
            old_adhoc = issue.issue_type
            issue.issue_type = 'adhoc' if new_adhoc == True else 'issue'
            issue.save()
            timepiece.IssueHistory.add_history(request.user, issue, "changed adhoc", old_adhoc, new_adhoc)
    messages.info(request, "%d issues changed adhoc: : %s" % (len(selected_issue_ids), form.cleaned_data['adhoc']))
    return HttpResponseRedirect(reverse('project_list', args=[selected_project.id]))

@csrf_exempt
@login_required
def auto_issue_sort(request, project_id, template="timepiece/project/auto_issue_sort.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]

    if 'ordered_states' in request.POST:
        ordered_states = request.POST['ordered_states'].split(",")
        issues = project.issues.order_by_project_id(project.id)

        bp = timepiece.BusinessPermissions.for_user(request.user, project.business)
        if not bp.has_edit_issues:
            raise PermissionDenied

        running_issue = issues[0]
        for state in ordered_states:
            issues_for_state = issues.filter(status2__name=state)
            for issue in issues_for_state:
                timepiece.ProjectIssueOrder.insert_after(issue=issue, set_after_this_issue=running_issue)
                running_issue = issue

        messages.info(request, "Auto ordered issues in %s" % project)

        return HttpResponse(json.dumps({'redirect_url':reverse('project_list', args=[project.id])}))
    else:
        context['states'] = [x['status2__name'] for x in project.issues.order_by("status2__name").values("status2__name").distinct()]
        context['project'] = project
        return render(request, template, context)

@login_required
def calendar(request, template="timepiece/calendar/calendar.html", context=None):
    context = context or {}
    _populate_calendar_events(request, context)
    context['form_new_event'] = timepiece_forms.CalendarEventCreateForm(context['users'], context['businesses'], request.POST or None)
    context['update_form'] = timepiece_forms.CalendarEventUpdateForm(context['users'], context['businesses'])
    return render(request, template, context)

@login_required
def calendar_events(request, context=None):
    context = context or {}
    _populate_calendar_events(request, context)

    events = [ _create_js_calendar_event(event) for event in context['calendar_events'] ] + \
             [ _create_js_entry_event(event) for event in context['entry_events'] ] + \
             [ _create_js_holiday_event(event) for event in context['holiday_events'] ]

    return HttpResponse(json.dumps(events))

def _create_js_entry_event(entry):

    if type(entry) == dict:

        start_time = entry['day']
        hours = float(entry['hours__sum'])
        end_time = start_time + datetime.timedelta(hours=hours)
        user = User.objects.get(pk=entry['user'])
        try:
            if 'business__business_id' in entry:
                business = timepiece.Business.objects.get(pk=entry['business__business_id'])
            else:
                business = None
        except timepiece.Business.DoesNotExist:
            business = None

        return { 'id': None,
                 'title': "%s %s (%.2f hours)" % (user.username, business.name if business else 'all businesses', hours),
                 'allDay': False,
                 'start': start_time.strftime("%Y-%m-%d %H:%M"),
                 'end': end_time.strftime("%Y-%m-%d %H:%M"),
                 'business_id': None,
                 'user_id': user.id,
                 'description': "%s (%.2f hours)" % (business.name if business else 'none', hours),
                 'event_type': 'actual',
                 'color': business.get_colour() if business else '#ffffff',
                 'textColor': "#000000",
                 'borderColor': "#0000ff",
                 'editable': False ,
                 }

    else:
        return { 'id': entry.id,
                 'title': "A:%s (%s, %s hrs)" % (entry.issue.project.business.name, entry.user.username, entry.hours),
                 'allDay': False,
                 'start': entry.start_time.strftime("%Y-%m-%d %H:%M"),
                 'end': entry.end_time.strftime("%Y-%m-%d %H:%M"),
                 'business_id': entry.business.id,
                 'user_id': entry.user.id,
                 'description': entry.comments + "\n\n" + entry.extended_comments,
                 'event_type': 'actual',
                 'color': entry.issue.project.business.get_colour(),
                 'textColor': "#000000",
                 'borderColor': "#0000ff",
                 'editable': False,
                 }

def _create_js_calendar_event(event):

    res = { 'id': event.id,
             'allDay': False,
             'start': event.start.strftime("%Y-%m-%d %H:%M"),
             'end': event.end.strftime("%Y-%m-%d %H:%M"),
             'business_id': event.business.id if event.business else None,
             'user_id': event.user.id,
             'description': event.description,
             'send_invites_to': event.send_invites_to or '',
             'event_type': event.event_type,
             'color': event.get_colour(),
             'textColor': "#121212" if event.event_type == "meeting" else "#000000",
             'borderColor': "#121212",
             'editable': True,
             'status': event.status
             }

    description = (event.description or "").strip()[0:30]
    if event.event_type == "meeting":
        res['title'] = "M: %s..." % description
    elif event.event_type == "sickday":
        res['title'] = "S: %s..." % description
    elif event.event_type == "office_closed":
        res['title'] = "X: %s..." % description
    elif event.business is None:
        res['title'] = "G: %s..." % description
    else:
        res['title'] = event.business.name

    res['title'] += " (%s, %s hrs)" % (event.user.username, event.hours)

    if event.is_open and event.start < datetime.datetime.today()-relativedelta(days=1):
        res['is_overdue'] = True

    return res

def _create_js_holiday_event(event):

    res = { 'id': event.id,
            'allDay': True,
            'start': event.applies_on.strftime("%Y-%m-%d"),
            'end': event.applies_on.strftime("%Y-%m-%d"),
            'description': event.name,
            'title': event.name,
            'color': "#ff00ff",
            'textColor': "#000000",
            'borderColor': "#121212",
            'editable': False
            }

    return res

def _populate_calendar_events(request, context):
    try:
        bps_for_scheduling = timepiece.BusinessPermissions.objects.filter(can_be_scheduled=True)
        users = timepiece.User.objects.filter(pk__in=[ x['user'] for x in bps_for_scheduling.order_by("user__username").values("user") ])

        bps_logged_in_user_can_view = timepiece.BusinessPermissions.objects.filter(can_view_calendar=True, user=request.user)
        bp_businesses_for_scheduling = [ x['business'] for x in bps_for_scheduling.order_by("business__name").values("business") ]
        businesses = timepiece.Business.objects.filter(pk__in=bp_businesses_for_scheduling)

        if not request.user.is_superuser:
            bp_businesses_logged_in_user_can_view = [ x['business'] for x in bps_logged_in_user_can_view.order_by("business__name").values("business") ]
            businesses = businesses.filter(pk__in=bp_businesses_logged_in_user_can_view)

        projects = timepiece.Project.objects.filter(business__in=businesses).filter_in_dev().order_by("business__name", "name").distinct()

        calendar_events = timepiece.CalendarEvent.objects.filter(user__in=users).filter(Q(business__in=businesses)|Q(business__isnull=True)).distinct().order_by("start")
        entry_events = timepiece.Entry.objects.all()

        if not request.user.is_superuser:
            calendar_events = calendar_events.filter(user=request.user)
            entry_events = entry_events.filter(user=request.user)
            users = users.filter(pk=request.user.pk)

        holiday_events = timepiece.Holiday.objects.all()

        filter_form = timepiece_forms.CalendarFilterForm(users, businesses, request.GET or None,
                                                         initial={'users':[request.user]})
        if filter_form.is_valid():
            calendar_events, entry_events, holiday_events = filter_form.save(calendar_events, entry_events, holiday_events)

        context['users'] = users
        context['businesses'] = businesses
        context['projects'] = projects
        context['calendar_events'] = calendar_events
        context['entry_events'] = entry_events
        context['holiday_events'] = holiday_events
        context['filter_form'] = filter_form
    except Exception, ex:
        logger.exception(ex)
        raise

@login_required
@csrf_exempt
def create_calendar_event(request, context=None):
    context = context or {}
    _populate_calendar_events(request, context)

    form_new_event = timepiece_forms.CalendarEventCreateForm(context['users'], context['businesses'], request.POST or None)
    if form_new_event.is_valid():

        if form_new_event.cleaned_data['business'] is not None:

            bp = timepiece.BusinessPermissions.for_user(request.user, form_new_event.cleaned_data['business'])
            if not bp.has_edit_calendar:
                raise PermissionDenied
        else:
            if not request.user.is_superuser and not request.user == form_new_event.cleaned_data['user']:
                # Can't create events for other people unless you're the admin
                raise PermissionDenied

        event = form_new_event.save()
        return HttpResponse(json.dumps(_create_js_calendar_event(event)))

    return HttpResponse("Save failed : %s" % form_new_event.errors)

@login_required
@csrf_exempt
def update_calendar_event(request, event_id, context=None):
    context = context or {}
    _populate_calendar_events(request, context)
    calendar_event = context['calendar_events'].get(pk=event_id)

    form = timepiece_forms.CalendarEventUpdateForm(context['users'], context['businesses'], request.POST or None, instance=calendar_event)
    if form.is_valid():

        if calendar_event.business is not None:
            bp = timepiece.BusinessPermissions.for_user(request.user, calendar_event.business)
            if not bp.has_edit_calendar:
                raise PermissionDenied
        else:
            if not request.user.is_superuser and (not request.user == calendar_event.user or not request.user == form.cleaned_data['user']):
                # Can't create events for other people unless you're the admin
                raise PermissionDenied

        calendar_event = form.save()
        return HttpResponse(json.dumps(_create_js_calendar_event(calendar_event)))

    logger.exception("Couldn't update calendar event %s because %s" % (calendar_event.id, form.errors))
    return HttpResponse("Save failed : %s" % form.errors)

@login_required
@csrf_exempt
def delete_calendar_event(request, event_id, context=None):
    context = context or {}
    _populate_calendar_events(request, context)
    calendar_event = context['calendar_events'].get(pk=event_id)

    if calendar_event.business is not None:
        bp = timepiece.BusinessPermissions.for_user(request.user, calendar_event.business)
        if not bp.has_edit_calendar:
            raise PermissionDenied
    else:
        if not request.user.is_superuser and not request.user == calendar_event.user:
            # Can't delete events for other people unless you're the admin
            raise PermissionDenied

    calendar_event.delete();
    return HttpResponse("Deleted")

@login_required
@csrf_exempt
def render_calendar_scheduled_sprints(request, template="timepiece/calendar/_scheduled_sprints.html", context=None):
    context = context or {}
    _populate_calendar_events(request, context)

    if request.user.is_superuser:
        context['projects_with_unscheduled_hours'] = [ p for p in context['projects'].filter_in_dev() if p.min_unscheduled_hours()>0 and p.min_estimate_hours()>0 ]
        context['projects_with_fully_scheduled_hours'] = [ p for p in context['projects'].filter_in_dev() if p.min_unscheduled_hours()<1 and p.min_estimate_hours()>0 ]
    else:
        context['projects_with_unscheduled_hours'] = []
        context['projects_with_fully_scheduled_hours'] = []
    return render(request, template, context)

@login_required
def business_cost_summary(request, business_id, template="timepiece/project/business_cost_summary.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    bp = timepiece.BusinessPermissions.objects.get_or_create(business=business, user=request.user)[0]
    if not bp.has_view_invoices:
        raise PermissionDenied
    if not bp.has_view_ctc_billable_rates:
        raise PermissionDenied

    context['business'] = business

    project_infos = []

    running_budget = 0
    running_spendable_budget = 0
    running_ctc = 0
    running_billable = 0
    running_amount_invoiced = 0
    running_amount_paid = 0
    running_amount_owed = 0
    running_costs_per_role = {}
    for project in timepiece.Project.objects.all().filter(business=business)\
                                                  .filter_by_logged_in_user(request.user)\
                                                  .order_by_business_id(business.id):
        stats = project.stats
        project_info = { 'project': project,
                         'status': project.status3.name,
                         'budget': project.budget,
                         'spendable_budget': project.spendable_budget,
                         'ctc': stats['ctc'],
                         'billable_core_rate': stats['billed_core_rate']}
        running_budget += project.budget
        running_spendable_budget += project.spendable_budget
        running_ctc += stats['ctc']
        running_billable += stats['billed_core_rate']
        project_infos.append(project_info)

        invoices = Invoice.objects.all()\
                                  .filter_by_logged_in_user(request.user)\
                                  .filter(project=project)
        running_project_amount_invoiced = 0
        running_project_amount_paid = 0
        running_project_amount_owed = 0
        for invoice in invoices:
            running_project_amount_invoiced += float(invoice.cost or 0)
            running_project_amount_paid += float(invoice.amount_paid or 0)
            running_project_amount_owed += float(invoice.amount_owed or 0)
        project_info['invoiced'] = running_project_amount_invoiced
        project_info['paid'] = running_project_amount_paid
        project_info['owed'] = running_project_amount_owed

        running_amount_invoiced += running_project_amount_invoiced
        running_amount_paid += running_project_amount_paid
        running_amount_owed += running_project_amount_owed

        project.calculate_new_stats(request.user)
        for mode in timepiece.TIME_TRACKING_MODES:
            running_costs_per_role.setdefault(mode, {'hours_billable_core_rate': 0})
            running_costs_per_role[mode]['hours_billable_core_rate'] += project.new_stats['per_role'][mode]['hours_billable_core_rate']

    context['project_infos'] = project_infos


    sundry_invoiced = 0
    sundry_paid = 0
    sundry_owed = 0
    for invoice in Invoice.objects.all()\
                                  .filter_by_logged_in_user(request.user)\
                                  .filter(business=business).filter(project__isnull=True):
        sundry_invoiced += invoice.cost
        sundry_paid += invoice.amount_paid
        sundry_owed += invoice.amount_owed

    running_amount_invoiced += sundry_invoiced
    running_amount_paid += sundry_paid
    running_amount_owed += sundry_owed

    context['sundry_totals'] = { 'invoiced': sundry_invoiced,
                                 'paid': sundry_paid,
                                 'owed': sundry_owed }

    context['project_totals'] = { 'budget': running_budget,
                                  'spendable_budget': running_spendable_budget,
                                  'ctc': running_ctc,
                                  'billable': running_billable,
                                  'invoiced': running_amount_invoiced,
                                  'paid': running_amount_paid,
                                  'owed': running_amount_owed,
                                  'per_role': running_costs_per_role }
    context['bp'] = bp

    return render(request, template, context)

@csrf_exempt
@login_required
def project_status_update(request, project_id):
    project = timepiece.Project.objects.get(pk=project_id)
    has_edit_status = timepiece.BusinessPermissions.objects\
                                                   .get_or_create(business=project.business, user=request.user)[0]\
                                                   .has_edit_project_states
    if not has_edit_status:
        raise PermissionDenied
    project.status3 = timepiece.ProjectStatus.objects\
                                             .get_or_create(business=project.business,
                                                            name=request.POST["selected_value"])[0]
    project.save()
    return HttpResponse(json.dumps({ 'new_value': project.status3.name,
                                     'is_open': project.is_open }),
                        content_type='application/json')

@login_required
def allowed_project_stati(request, project_id):
    return HttpResponse(json.dumps(timepiece.Project.PROJECT_STATUSES), content_type='application/json')

@login_required
@csrf_exempt
def business_comments(request, business_id):

    try:
        business = timepiece.Business.objects.get(id = business_id)
    except timepiece.Business.DoesNotExist:
        business = None

    bp = timepiece.BusinessPermissions.objects.get_or_create(business=business, user=request.user)[0]
    if not bp.has_view_business_comments:
        raise PermissionDenied

    form = None
    if bp.has_edit_business_comments:
        comment = timepiece.BusinessComment.objects.get_or_create(business=business, defaults={'modified_by':request.user})[0]
        form = timepiece_forms.BusinessCommentForm(request.POST or None, instance=comment)
        old_comment = comment.comment
        if form.is_valid():
            comment = form.save(commit=False)
            comment.modified_by = request.user
            comment.save()
            form.save_m2m()
            timepiece.BusinessHistory.add_history(request.user, business, "comment", old_comment, comment.comment)
            return HttpResponse(json.dumps({ 'success':True }))
    else:
        comment = None

    context = { 'business':business,
                'comment':comment,
                'business_comment_form':form,
                'current_user':request.user,
                'business_permissions_by_user':timepiece.BusinessPermissions.by_user(business)
                }
    return render(request, 'timepiece/project/project_comments.html',
                              context)

@login_required
def show_business_history(request, business_id, template="timepiece/project/business_history.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not bp.has_edit_project_detail:
        return HttpResponse("Sorry, you don't have permission to view the business history")

    context['business'] = business
    context['history'] = timepiece.BusinessHistory.for_business(business)
    return render(request, template, context)

@login_required
def render_checklist_navigation(request, business_id, template="timepiece/project/_checklist_menu.html", context=None):
    context = context or {}
    if not business_id:
        business = None
    else:
        business = timepiece.Business.objects.get(pk=business_id)
    context['business'] = business
    context['current_user'] = request.user
    return render(request, template, context)

@login_required
def render_checklist_status_icon_traffic(request, business_id, template="timepiece/project/_checklist_status_icon_traffic.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    context['business'] = business
    return render(request, template, context)

@login_required
def render_checklist_status_icon_dev(request, business_id, template="timepiece/project/_checklist_status_icon_dev.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    context['business'] = business
    return render(request, template, context)

@login_required
def render_checklist_status_icon_finance(request, business_id, template="timepiece/project/_checklist_status_icon_finance.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    context['business'] = business
    return render(request, template, context)

@login_required
def traffic_checklist(request, business_id, template="timepiece/project/traffic_checklist.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not (bp.has_do_traffic_checklist and bp.has_view_ctc_billable_rates and bp.has_view_ctc_rates):
        return HttpResponse("Sorry, you don't have access to the traffic checklist")

    checklist = timepiece.TrafficChecklist.get_todays_checklist(request.user, business)
    checklist.recalculate_all()

    form = timepiece_forms.TrafficChecklistForm(request.POST or None, instance=checklist)
    if form.is_valid():
        checklist = form.save(commit=False)
        checklist.business = business
        checklist.modified_by=request.user
        checklist.save()
        form.save_m2m()

        # ajax call, don't redirect
        context['msg'] = 'Saved'

    context['form'] = form
    context['checklist'] = checklist
    context['business'] = business
    context['previous_checklists'] = timepiece.TrafficChecklist.objects.all().filter(business=business).order_by("-pk")[1:5]
    return render(request, template, context)

@login_required
def dev_checklist(request, business_id, template="timepiece/project/dev_checklist.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not (bp.has_do_dev_checklist and bp.has_view_ctc_billable_rates and bp.has_view_ctc_rates):
        return HttpResponse("Sorry, you don't have access to the dev checklist")

    checklist = timepiece.DevChecklist.get_todays_checklist(request.user, business)
    checklist.recalculate_all()

    form = timepiece_forms.DevChecklistForm(request.POST or None, instance=checklist)
    if form.is_valid():
        checklist = form.save(commit=False)
        checklist.business = business
        checklist.modified_by=request.user
        checklist.save()
        form.save_m2m()

        # ajax call, don't redirect
        context['msg'] = 'Saved'

    context['form'] = form
    context['checklist'] = checklist
    context['business'] = business
    context['previous_checklists'] = timepiece.DevChecklist.objects.all().filter(business=business).order_by("-pk")[1:5]
    return render(request, template, context)

@login_required
def finance_checklist(request, business_id, template="timepiece/project/finance_checklist.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    bp = timepiece.BusinessPermissions.for_user(request.user, business)
    if not (bp.has_do_finance_checklist and bp.has_view_ctc_billable_rates and bp.has_view_ctc_rates):
        return HttpResponse("Sorry, you don't have access to the finance checklist")

    checklist = timepiece.FinanceChecklist.get_todays_checklist(request.user, business)
    checklist.recalculate_all()

    form = timepiece_forms.FinanceChecklistForm(request.POST or None, instance=checklist)
    if form.is_valid():
        checklist = form.save(commit=False)
        checklist.business = business
        checklist.modified_by=request.user
        checklist.save()
        form.save_m2m()

        # ajax call, don't redirect
        context['msg'] = 'Saved'

    context['form'] = form
    context['checklist'] = checklist
    context['business'] = business
    context['previous_checklists'] = timepiece.FinanceChecklist.objects.all().filter(business=business).order_by("-pk")[1:5]
    return render(template, context)

@login_required
def recalculate_all_checklists(request, context=None):
    context = context or {}
    for business in timepiece.Business.objects.filter_has_at_least_one_open_project():
        timepiece.DevChecklist.get_todays_checklist(request.user, business).recalculate_all()
        timepiece.TrafficChecklist.get_todays_checklist(request.user, business).recalculate_all()
        timepiece.FinanceChecklist.get_todays_checklist(request.user, business).recalculate_all()
    messages.info(request, "Checklists updated")
    return HttpResponseRedirect(reverse('list_projects'))

@login_required
def user_notifications(request, template="timepiece/project/user_notifications.html", context=None):
	context = context or {}
	timepiece.UserNotification.create_default_notifications(request.user)
	notifications = timepiece.UserNotification.objects.filter(user=request.user, seen=False, applies_on=datetime.datetime.today().date())
	context['notifications'] = notifications
	if notifications.count() == 0:
		return HttpResponse("")

	return render(request, template, context)

@login_required
def seen_user_notification(request, notification_id, context=None):
	timepiece.UserNotification.objects.filter(user=request.user, pk=notification_id).update(seen=True)
	return HttpResponse(json.dumps({ "status":"ok" }))

@login_required
def seen_all_user_notifications(request, context=None):
	timepiece.UserNotification.objects.filter(user=request.user).update(seen=True)
	return HttpResponse(json.dumps({ "status":"ok" }))

@login_required
@csrf_exempt
def clear_issue_adhoc_status(request, issue_id, context=None):
    context = context or {}
    issue = timepiece.Issue.objects.get(pk=issue_id)
    bp = timepiece.BusinessPermissions.for_user(request.user, issue.project.business)
    if not bp.has_add_issue:
        return HttpResponse("No permission to do that")
    issue.issue_type = 'issue'
    issue.save()
    return HttpResponse("{'status':'ok'}")

def blocked(request, template="blocked.html"):
    context = {}
    return render(request, template, context)

def dashboard(request, template="timepiece/dashboard/dashboard.html"):
    context = {}

    now = datetime.datetime.now().replace(day=1, hour=0, minute=0, second=0)+relativedelta(months=1)
    running_now = now
    num_months = 4
    context['quotes_by_month'] = []
    context['invoices_by_month'] = []
    context['employees_by_month'] = []
    context['projects_by_month'] = []
    for x in range(num_months):
        date_from = running_now - relativedelta(months=1)
        context['quotes_by_month'].append({ 'month' : date_from,
                                            'quotes_by_sent_to_client_at' : Quote.objects.filter(sent_to_client_at__gte=date_from, sent_to_client_at__lt=running_now),
                                            'quotes_by_accepted_at' : Quote.objects.filter(accepted_at__gte=date_from, accepted_at__lt=running_now)})

        context['invoices_by_month'].append({ 'month' : date_from,
                                              'invoices_waiting' : Invoice.objects\
                                                                          .filter_by_logged_in_user(request.user)\
                                                                          .filter(status='open', payment_due__gte=date_from, payment_due__lt=running_now),
                                              'invoices_paid' : Invoice.objects\
                                                                       .filter_by_logged_in_user(request.user)\
                                                                       .filter(status='paid', payment_due__gte=date_from, payment_due__lt=running_now)})

        entries = timepiece.Entry.objects_for_reporting.filter(start_time__gte=date_from, start_time__lte=running_now)
        salaries = timepiece.Salary.objects.filter(date__gte=date_from, date__lt=running_now, amount__gt=0)
        business_days = timepiece.Holiday.business_days_in_month(date_from)
        context['employees_by_month'].append( {'month' : date_from,
                                               'salaries' : salaries,
                                               'entries': entries,
                                               #'average_hours_per_employee': entries.total_hours()/ (salaries.count() or 1),
                                               #'average_daily_hours_per_employee': entries.total_hours() / (salaries.count() or 1) / len(business_days) or 1,
                                               'number_of_business_days': len(business_days),
                                               } )

        running_now = date_from

    checklist_errors = []
    def create_checklist_info(state, checklist_name, business, checklist, checklist_errors=checklist_errors):
        #checklist.recalculate_all()
        if checklist.is_ok():
            return
        checklist_errors.append( (business,
                                  "(%s) %d %s errors" % (state, checklist.items.filter(passed=False).count(), checklist_name),
                                  checklist.items.filter(passed=False).values('msg')[0:3]) )

    def create_checklist_summary(state, businesses):
        for business in businesses:
            create_checklist_info(state, 'dev', business, timepiece.DevChecklist.get_todays_checklist(request.user, business))
            create_checklist_info(state, 'traffic', business, timepiece.TrafficChecklist.get_todays_checklist(request.user, business))
            create_checklist_info(state, 'finance', business, timepiece.FinanceChecklist.get_todays_checklist(request.user, business))

    businesses = timepiece.Business.objects.all().filter_by_logged_in_user(request.user).order_by("name").distinct()
    create_checklist_summary("active", businesses.filter_has_any_active_projects())
    create_checklist_summary("pending", businesses.filter_has_only_pending_projects())
    #create_checklist_summary(businesses.filter_has_hopeful_projects())
    context['checklist_errors'] = checklist_errors

    return render(request, template, context)

@login_required
@csrf_exempt
def quick_clocker(request, template="timepiece/time-sheet/quick_clocker.html", context=None):
    context = context or {}

    users = timepiece.BusinessPermissions.get_users_who_can_capture_time().order_by("username")
    users = users.filter(pk=request.user.id)
    allowed_projects = timepiece.Project.objects.all().filter_by_logged_in_user(request.user)
    projects = allowed_projects.filter_can_add_dev_time_states().filter_open().order_by("business__name", "name")
    context['users'] = users
    context['projects'] = projects

    clock_in_form = timepiece_forms.QuickClockerForm(request.user, users, projects, request.POST or None)
    if clock_in_form.is_valid():
        activity = timepiece.Activity.objects.get_or_create(code='dev')[0]
        location = timepiece.Location.objects.get_or_create(name='office')[0]
        project = clock_in_form.cleaned_data['project']
        issue = _get_quick_clocker_issue(project, clock_in_form.cleaned_data['user'])
        clock_time = api.localised_today()
        new_entry = timepiece.Entry.objects.create(user=clock_in_form.cleaned_data['user'],
                                                   created_by=request.user,
                                                   source='quick_clocker',
                                                   start_time=clock_time,
                                                   end_time=None,
                                                   activity=activity,
                                                   location=location,
                                                   issue=issue,
                                                   status='approved',
                                                   comments="qc",
                                                   extended_comments="")

        for open_entry in timepiece.Entry.objects.filter(user=new_entry.user).exclude(pk=new_entry.id).is_open():
            open_entry.end_time = clock_time
            open_entry.save()

        messages.info(request, "%s clocked into %s" % (new_entry.user.username, project.long_name()))

        return HttpResponseRedirect(reverse('quick_clocker'))

    allowed_entries = timepiece.Entry.objects.all().filter_by_logged_in_user(request.user)
    quick_clocker_entries = allowed_entries.filter(source='quick_clocker')
    users_entries = allowed_entries.filter(user=request.user)
    users_quick_clocker_entries = users_entries.filter(source='quick_clocker')
    context['clocked_in_entries'] = users_quick_clocker_entries.is_open().order_by("user__username")
    context['recently_clocked_out_entries'] = users_quick_clocker_entries.is_closed().order_by("-date_updated")[0:15]
    context['recent_dev_entries'] = users_quick_clocker_entries.filter(source='emacs').is_closed().order_by("-end_time")[0:20]
    logged_in_users_active_entry = users_quick_clocker_entries.filter(user=request.user).first()
    if context.get('clock_out_form', None) is None:
        context['clock_out_form'] = timepiece_forms.QuickClockerClockOutForm(context['clocked_in_entries'],
                                                                             initial={'entry':logged_in_users_active_entry,
                                                                                      'clock_out_time':api.localised_today()})
    context['clock_in_form'] = clock_in_form

    return render(request, template, context)

@login_required
@csrf_exempt
def quick_clocker_clock_out(request):
    context = {}

    entries = timepiece.Entry.objects.all().filter(user=request.user, source='quick_clocker').is_open()
    clock_out_form = timepiece_forms.QuickClockerClockOutForm(entries, request.POST or None,
                                                              initial={'clock_out_time':api.localised_today()})
    if clock_out_form.is_valid():
        entry = clock_out_form.cleaned_data['entry']
        entry.end_time = clock_out_form.cleaned_data['clock_out_time']
        entry.save()
        messages.info(request, "%s clocked out of %s" % (entry.user.username, entry.issue.project.long_name()))
        return HttpResponseRedirect(reverse('quick_clocker'))
    context['clock_out_form'] = clock_out_form
    return quick_clocker(request, context=context)


#@permission_required('timepiece.change_entry')
@render_with('timepiece/time-sheet/quick_clocker_edit_entry.html')
@login_required
@csrf_exempt
def quick_clocker_edit_entry(request, entry_id=None):
    entry = timepiece.Entry.objects_original.all().filter(user=request.user).get(pk=entry_id)
    projects = timepiece.Project.objects.filter(business=entry.issue.project.business).filter_can_add_dev_time_states().order_by("name")
    form = timepiece_forms.QuickClockerEditEntry(projects, request.POST or None, instance=entry)
    if form.is_valid():
        form.save()
        if not entry.issue:
            issue = _get_quick_clocker_issue(form.cleaned_data['project'], entry.user)
            entry.issue = issue
            entry.save()
        messages.info(request, "Entry updated")
        return HttpResponseRedirect(reverse('quick_clocker_edit_entry', kwargs={'entry_id':entry_id}))
    return {'form': form, 'entry': entry}

@permission_required('timepiece.change_entry')
@login_required
@csrf_exempt
def quick_clocker_delete_entry(request, entry_id=None):
    entry = timepiece.Entry.objects_original.get(pk=entry_id,)
    entry.delete()
    return HttpResponseRedirect(reverse('quick_clocker'))

def _get_quick_clocker_issue(project, user):

    rate = timepiece.Rate.objects.filter(project=project, user=user).first()
    if rate is None:
        issue_subject = "general development"
    else:
        issue_subject = rate.time_tracking_mode

    try:
        issue = timepiece.Issue.objects.get(project=project, subject=issue_subject, assigned_to=user)
    except timepiece.Issue.MultipleObjectsReturned:
        issue = timepiece.Issue.objects.filter(project=project, subject=issue_subject, assigned_to=user).last()
    except timepiece.Issue.DoesNotExist:
        issue = timepiece.Issue.objects.create(project=project,
                                               subject=issue_subject,
                                               auto_created_during_import=True,
                                               issue_type='issue',
                                               status2=timepiece.IssueStatus.objects.get_or_create(name='quick_clocker', business=project.business)[0],
                                               assigned_to=user,
                                               created_by=user,
                                               number=timepiece.Issue.get_next_issue_number(project.business),
                                               description="General work",
                                               story_points=0)
        timepiece.ProjectIssueOrder.insert_at_the_end(issue)
    return issue

@permission_required('timepiece.scheduler')
@login_required
@csrf_exempt
def scheduler(request, template="timepiece/scheduler/scheduler.html", context=None):
    context = context or {}

    schedule_filter_form = timepiece_forms.ScheduleFilterForm(request.GET or None,
                                                              initial={'year':datetime.datetime.now().year,
                                                                       'month':datetime.datetime.now().month})
    if schedule_filter_form.is_valid():
        date_from = datetime.datetime(year=schedule_filter_form.cleaned_data['year'],
                                      month=schedule_filter_form.cleaned_data['month'],
                                      day=1)
    else:
        date_from = datetime.datetime.now().replace(day=1)
    date_to = date_from + relativedelta(months=1)

    businesses = timepiece.Business.objects.filter_has_can_add_dev_time_projects().distinct()
    users = timepiece.BusinessPermissions.get_users_who_can_capture_time().order_by("username")

    schedules = timepiece.Schedule.objects.filter(scheduled_date__gte=date_from, scheduled_date__lt=date_to)

    actuals = timepiece.Entry.objects.filter(start_time__gte=date_from, start_time__lt=date_to)

    context['businesses'] = businesses
    context['schedules'] = schedules
    context['actuals'] = actuals
    context['users'] = users
    context['date'] = date_from
    context['schedule_filter_form'] = schedule_filter_form
    context['public_holidays'] = timepiece.Holiday.objects.filter(applies_on__gte=date_from, applies_on__lt=date_to)

    return render(request, template, context)

@permission_required('timepiece.scheduler')
@login_required
@csrf_exempt
def schedule_edit(request, business_id, user_id, scheduled_date):
    from timepiece.templatetags.scheduler_tags import scheduled_status

    scheduled_date = datetime.datetime.strptime(scheduled_date, "%Y%m%d")
    schedule = timepiece.Schedule.objects.get_or_create(business_id=business_id, user_id=user_id, scheduled_date=scheduled_date,
                                                        defaults={'num_hours':0})[0]
    form = timepiece_forms.ScheduleForm(request.POST or None, instance=schedule)
    if form.is_valid():
        schedule = form.save()
        date_from = scheduled_date.replace(day=1)
        date_to = date_from + relativedelta(months=1)
        schedules = timepiece.Schedule.objects.filter(scheduled_date__gte=date_from, scheduled_date__lt=date_to)
        actuals = timepiece.Entry.objects.filter(start_time__gte=date_from, start_time__lt=date_to)
        return HttpResponse( json.dumps( { 'hours_captured': schedule.num_hours,
                                           'hours_for_user': "%d" % (schedules.hours_for_user(user_id) or 0),
                                           'hours_for_user_is_over':  (actuals.hours_for_user(user_id) or 0) > (schedules.hours_for_user(user_id) or 0),
                                           'hours_for_business': "%d" % (schedules.hours_for_business(business_id) or 0),
                                           'hours_total': schedules.hours(),
                                           'scheduled_status_msg': scheduled_status(context={'date':date_from, 'schedules': schedules}, user=User.objects.get(pk=user_id)),
                                           'billable_for_user': _format_money(schedules.billable_for_user(user_id)),
                                           'billable_for_business': _format_money(schedules.billable_for_business(business_id)),
                                           'billable_total': _format_money(schedules.billable()),
                                           } ) )

    raise Exception(form.errors)

def _format_money(x):
    if not x:
        return ""
    return "R" + intcomma(int(x or 0))

@login_required
@csrf_exempt
def send_calendar_invite(request, event_id):
    send_invites_to = request.POST['send_invites_to']
    event = timepiece.CalendarEvent.objects.get(pk=event_id)
    try:
        caldav = CalDavHelper()
        caldav.send_invite(event, send_invites_to)
        return HttpResponse( json.dumps( {'status': 'ok' } ) )
    except Exception, ex:
        logger.exception(ex)
        return HttpResponse( json.dumps( {'status': 'failed',
                                          'error_msg': str(ex)} ) )


@login_required
@csrf_exempt
def issue_action_menu(request, issue_id, template="timepiece/project/_issue_action_menu.html"):
    context = { 'issue_id': issue_id }
    return render(request, template, context)

@login_required
@csrf_exempt
def client_list(request, template="timepiece/client/client_list.html", context=None):
    context = context or {}
    if not request.user.is_superuser:
        return HttpResponseForbidden("Not allowed")

    clients = timepiece.Company.objects.all().order_by("name")
    context['clients'] = clients

    return render(request, template, context)

@login_required
@csrf_exempt
def add_client(request, template="timepiece/client/add_client.html", context=None):
    context = context or {}
    form = timepiece_forms.ClientForm(request.POST or None, request.FILES or None)
    if not request.user.is_superuser:
        return HttpResponseForbidden("Not allowed")

    if form.is_valid():
        form.save()
        messages.info(request, "Client created")
        return HttpResponseRedirect(reverse('client_list'))

    context['form'] = form
    return render(request, template, context)

@login_required
@csrf_exempt
def edit_client(request, client_code, template="timepiece/client/add_client.html", context=None):
    context = context or {}
    if not request.user.is_superuser:
        return HttpResponseForbidden("Not allowed")

    client = timepiece.Company.objects.get(code=client_code)
    form = timepiece_forms.ClientForm(request.POST or None, request.FILES or None, instance=client)
    if form.is_valid():
        form.save()
        messages.info(request, "Client updated")
        return HttpResponseRedirect(reverse('client_list'))

    context['form'] = form

    return render(request, template, context)

def project_cost_summary(request, project_id, template="timepiece/project/project_cost_summary.html"):
    context = {}
    project = timepiece.Project.objects.get(pk=project_id)
    bp = timepiece.BusinessPermissions.for_user(request.user, project.business)
    if not bp.has_view_ctc_billable_rates:
        return HttpResponse("No permission to do that")

    project.calculate_new_stats(request.user)
    context['project'] = project

    return render(request, template, context)


@login_required
@csrf_exempt
def issue_clock_in(request):
    user_id = request.user.id
    issue_id = request.POST['issue_id']
    activity = timepiece.Activity.objects.get_or_create(code='dev')[0]
    location = timepiece.Location.objects.get_or_create(name='office')[0]
    clock_time = api.localised_today()
    new_entry = timepiece.Entry.objects.create(user=request.user,
                                               created_by=request.user,
                                               source='quick_clocker',
                                               start_time=clock_time,
                                               end_time=None,
                                               activity=activity,
                                               location=location,
                                               issue_id=issue_id,
                                               status='approved',
                                               comments="rowing",
                                               extended_comments="")

    for open_entry in timepiece.Entry.objects.filter(user=request.user).exclude(pk=new_entry.id).is_open():
        open_entry.end_time = clock_time
        open_entry.save()
    return HttpResponse(json.dumps({"status":"ok"}))

@login_required
@csrf_exempt
def issue_clock_out(request):
    clock_time = api.localised_today()
    for open_entry in timepiece.Entry.objects.filter(user=request.user).is_open():
        open_entry.end_time = clock_time
        open_entry.save()
    return HttpResponse(json.dumps({"status":"ok"}))

@login_required
def download_issue_attachment(request, issue_attachment_id):
    issue_attachment = timepiece.IssueAttachment.objects.get(pk=issue_attachment_id)
    bp = timepiece.BusinessPermissions.for_user(request.user, issue_attachment.issue.project.business)
    if not bp.has_view_issues:
        raise PermissionDenied
    return download_media(request,
                          issue_attachment.attachment.name,
                          content_type=issue_attachment.content_type)
