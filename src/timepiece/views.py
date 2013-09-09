import random
import calendar
import csv
import timings
from xhtml2pdf import pisa  
import operator
from dateutil.rrule import DAILY, WDAYMASK, rrule, MO,TU,WE,TH,FR
import json
import jsonpickle
from django.db import connection
from pdf import render_to_pdf
import datetime
from django.template import Template
import math
import urllib
import urlparse
from copy import deepcopy, copy
from collections import defaultdict
import time

from decimal import Decimal
from dateutil.relativedelta import relativedelta
from itertools import groupby

from django.contrib import messages
from django.template import RequestContext
from django.shortcuts import (render_to_response, get_object_or_404, redirect,
                              render)
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse, resolve
from django.http import HttpResponse, HttpResponseRedirect
from django.http import  Http404, HttpResponseForbidden
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.models import User
from django.contrib.auth import models as auth_models
from django.db.models import Sum, Count, Q, F, Max, Min
from django.db import transaction
from django.db import DatabaseError
from django.conf import settings
from django.utils.datastructures import SortedDict
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

from timepiece.utils import render_with, reverse_lazy, get_week_start

from timepiece import models as timepiece
from timepiece import utils
from timepiece import forms as timepiece_forms
from timepiece.templatetags.timepiece_tags import seconds_to_hours
from timepiece.templatetags.timepiece_tags import get_active_hours
from emacs_importer import report_helper
from emacs_importer import models as bamboo_models
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import logging

logger = logging.getLogger('timepiece_view')


@login_required
def quick_search(request):
    if request.GET:
        form = timepiece_forms.QuickSearchForm(request.GET)
        if form.is_valid():
            return HttpResponseRedirect(form.save())
    return render_to_response('timepiece/search_results.html', {
            'form': form,
        },
        context_instance=RequestContext(request)
    )


class CSVMixin(object):
    def render_to_response(self, context):
        response = HttpResponse(content_type='text/csv')
        fn = self.get_filename(context)
        response['Content-Disposition'] = 'attachment; filename=%s.csv' % fn
        rows = self.convert_context_to_csv(context)
        writer = csv.writer(response)
        for row in rows:
            writer.writerow(row)
        return response

    def get_filename(self, context):
        raise NotImplemented("You must implement this in the subclass")

    def convert_context_to_csv(self, context):
        "Convert the context dictionary into a CSV file"
        raise NotImplemented("You must implement this in the subclass")

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
        'project__business',
    ).filter(
        time_q,
        user=request.user
    ).select_related('project', 'activity', 'location')
    today = datetime.date.today()
    assignments = timepiece.ContractAssignment.objects.filter(
        user=request.user,
        user__project_relationships__project=F('contract__project'),
        end_date__gte=today,
        contract__status='current',
    ).order_by('contract__project__type', 'end_date')
    assignments = assignments.select_related('user', 'contract__project__type')
    activity_entries = list(entries.values(
        'billable',
    ).annotate(sum=Sum('hours')).order_by('-sum'))
    others_active_entries = timepiece.Entry.objects.filter(
        end_time__isnull=True,
    ).exclude(
        user=request.user,
    ).select_related('user', 'project', 'activity')
    my_active_entries = timepiece.Entry.objects.select_related(
        'project__business',
    ).only(
        'user', 'project', 'activity', 'start_time'
    ).filter(
        user=request.user,
        end_time__isnull=True,
    )

    for current_entry in my_active_entries:
        for activity_entry in activity_entries:
            if current_entry.billable == activity_entry['billable']:
                activity_entry['sum'] += get_active_hours(current_entry)
                break
    current_total = sum([entry['sum'] for entry in activity_entries])

#     temporarily disabled until the allocations represent accurate goals
#     -TM 6/27
    allocations = []
    allocated_projects = timepiece.Project.objects.none()
#    allocations = timepiece.AssignmentAllocation.objects.during_this_week(
#        request.user
#        ).order_by('assignment__contract__project__name')
#    allocated_projects = allocations.values_list(
#    'assignment__contract__project',)

    project_entries = entries.exclude(
        project__in=allocated_projects,
        end_time__isnull=True
    ).values(
        'project__name', 'project__pk', 'project__business__name'
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
        'activity_entries': activity_entries,
        'current_total': current_total,
        'others_active_entries': others_active_entries,
        'my_active_entries': my_active_entries,
        'view_entries': view_entries,
    }
    return context


@permission_required('timepiece.can_clock_in')
@transaction.commit_on_success
def clock_in(request):
    """For clocking the user into a project"""
    active_entry = timepiece.Entry.no_join.filter(user=request.user,
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
        message = 'You have clocked into %s' % entry.project
        messages.info(request, message)
        return HttpResponseRedirect(reverse('timepiece-entries'))
    return render_to_response('timepiece/time-sheet/entry/clock_in.html', {
            'form': form,
            'active': active_entry,
        },
        context_instance=RequestContext(request),
    )


@permission_required('timepiece.can_clock_out')
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
    return render_to_response(
        'timepiece/time-sheet/entry/clock_out.html',
        context,
        context_instance=RequestContext(request),
    )


@permission_required('timepiece.can_pause')
def toggle_paused(request, entry_id):
    """
    Allow the user to pause and unpause their open entries.  If this method is
    invoked on an entry that is not paused, it will become paused.  If this
    method is invoked on an entry that is already paused, it will unpause it.
    Then the user will be redirected to their log entry list.
    """

    try:
        # retrieve the log entry
        entry = timepiece.Entry.no_join.get(pk=entry_id,
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
def create_edit_entry(request, entry_id=None):
    if entry_id:
        try:
            entry = timepiece.Entry.no_join.get(
                pk=entry_id,
                user=request.user,
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
def reject_entry(request, entry_id):
    """
    Admins can reject an entry that has been verified or approved but not
    invoiced to set its status to 'unverified' for the user to fix.
    """
    user = request.user
    return_url = request.REQUEST.get('next', reverse('timepiece-entries'))
    try:
        entry = timepiece.Entry.no_join.get(pk=entry_id)
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
    return render_to_response('timepiece/time-sheet/entry/reject_entry.html', {
                                  'entry': entry,
                                  'next': request.REQUEST.get('next'),
                              },
                              context_instance=RequestContext(request))


@permission_required('timepiece.delete_entry')
def delete_entry(request, entry_id):
    """
    Give the user the ability to delete a log entry, with a confirmation
    beforehand.  If this method is invoked via a GET request, a form asking
    for a confirmation of intent will be presented to the user.  If this method
    is invoked via a POST request, the entry will be deleted.
    """

    try:
        # retrieve the log entry
        entry = timepiece.Entry.no_join.get(pk=entry_id,
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

    return render_to_response('timepiece/time-sheet/entry/delete_entry.html',
                              {'entry': entry},
                              context_instance=RequestContext(request))


@permission_required('timepiece.view_entry_summary')
@render_with('timepiece/time-sheet/reports/general_ledger.html')
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

    entries = timepiece.Entry.no_join.filter_by_logged_in_user(request.user).values(
        'project__id',
        'project__business__id',
        'project__business__name',
        'project__name',
    ).order_by(
        'project__id',
        'project__business__id',
        'project__business__name',
        'project__name',
    )

    dates = Q()
    if from_date:
        dates &= Q(start_time__gte=from_date)
    if to_date:
        dates &= Q(end_time__lte=to_date)
    project_totals = entries.filter(dates).annotate(total_hours=Sum('hours'))
    project_totals = project_totals.order_by('project__name')
    total_hours = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(dates).aggregate(
        hours=Sum('hours')
    )['hours']
    people_totals = timepiece.Entry.no_join.filter_by_logged_in_user(request.user).values('user', 'user__first_name',
                                                                                       'user__last_name')
    people_totals = people_totals.order_by('user__last_name').filter(dates)
    people_totals = people_totals.annotate(total_hours=Sum('hours'))

    #business_per_person_totals = entries.filter(dates).values('user__username', 'project__business__name').annotate(total_hours=Sum('hours'))
    business_per_person_totals = entries.filter(dates).values('user__username', 'project__business__name').annotate(total_hours=Sum('hours')).order_by('project__business__name')
    business_per_project_per_person_totals = entries.filter(dates).values('user__username', 'project__name', 'project__business__name').annotate(total_hours=Sum('hours')).order_by('project__name')

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


class ProjectTimesheet(DetailView):
    template_name = 'timepiece/time-sheet/projects/view.html'
    model = timepiece.Project
    context_object_name = 'project'

    @method_decorator(permission_required('timepiece.view_project_time_sheet'))
    def dispatch(self, *args, **kwargs):
        return super(ProjectTimesheet, self).dispatch(*args, **kwargs)

    def get(self, *args, **kwargs):
        if 'csv' in self.request.GET:
            request_get = self.request.GET.copy()
            request_get.pop('csv')
            return_url = reverse('export_project_time_sheet',
                                 kwargs={'pk': self.get_object().pk})
            return_url += '?%s' % urllib.urlencode(request_get)
            return redirect(return_url)
        return super(ProjectTimesheet, self).get(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(ProjectTimesheet, self).get_context_data(**kwargs)
        project = self.object
        date_form = timepiece_forms.DateOnlyForm(self.request.GET)
        from_date, to_date = _get_filter_dates_only(self.request, context)
        entries_qs = timepiece.Entry.objects
        if from_date or to_date:
            entries_qs = entries_qs.timespan(from_date, to_date, span='month')
            
        entries_qs = entries_qs.filter_by_logged_in_user(self.request.user).filter(project=project)

        extra_values = ('start_time', 'end_time', 'comments', 'seconds_paused',
                'id', 'location__name', 'project__name', 'activity__name',
                'status')
        month_entries = entries_qs.date_trunc('month',
                extra_values).order_by('start_time')
        total = entries_qs.aggregate(hours=Sum('hours'))['hours']
        user_entries = entries_qs.order_by().values(
            'user__first_name', 'user__last_name').annotate(
            sum=Sum('hours')).order_by('-sum'
        )
        activity_entries = entries_qs.order_by().values(
            'activity__name').annotate(
            sum=Sum('hours')).order_by('-sum'
        )
        return {
            'project': project,
            'from_date': from_date,
            'to_date': to_date - datetime.timedelta(days=1) if to_date else None,
            'entries': month_entries,
            'total': total,
            'user_entries': user_entries,
            'activity_entries': activity_entries,
            'date_form': date_form,
        }


class ProjectTimesheetCSV(CSVMixin, ProjectTimesheet):

    def get_filename(self, context):
        project = self.object.name
        if context['to_date']:
            if isinstance(context['to_date'], basestring):
                to_date_str = context['to_date'].replace(u'/', u'-')
            else:
                to_date_str = context['to_date'].strftime('%m-%d-%Y')
        else:
            to_date_str = 'All Entries'
        return "Project_timesheet {0} {1}".format(project, to_date_str)

    def convert_context_to_csv(self, context):
        rows = []
        rows.append([
            'Date',
            'Person',
            'Activity',
            'Location',
            'Time In',
            'Time Out',
            'Breaks',
            'Hours',
        ])
        for entry in context['entries']:
            data = [
                entry['start_time'].strftime('%x'),
                ' '.join((entry['user__first_name'],
                          entry['user__last_name'])),
                entry['activity__name'],
                entry['location__name'],
                entry['start_time'].strftime('%X'),
                entry['end_time'].strftime('%X'),
                seconds_to_hours(entry['seconds_paused']),
                entry['hours'],
            ]
            rows.append(data)
        total = context['total']
        rows.append(('', '', '', '', '', '', 'Total:', total))
        return rows


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
    return render_to_response('timepiece/time-sheet/people/projects.html',
                              context, context_instance=RequestContext(request))



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
        projects = timepiece.Project.objects.filter(business=business)
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
                'expand_older':index is not None}
    return render_to_response('timepiece/card.html',
                              context, context_instance=RequestContext(request))


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
    extra_values = ('start_time', 'end_time', 'comments', 'seconds_paused', 'project__status__label',
            'id', 'location__name', 'project__name', 'activity__name', 'project__business__name',
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
        'project__name', 'project__business__name').annotate(sum=Sum('hours')).order_by('-sum')
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
    return render_to_response('timepiece/time-sheet/people/view.html',
        context, context_instance=RequestContext(request))


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
    entries = timepiece.Entry.no_join.filter(user=user_id,
                                             end_time__gte=from_date,
                                             end_time__lt=to_date)
    active_entries = timepiece.Entry.no_join.filter(
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
    return render_to_response('timepiece/time-sheet/people/change_status.html',
        context, context_instance=RequestContext(request))


@login_required
@transaction.commit_on_success
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
        'project__id': project.id
    }
    if from_date:
        entries_query.update({'end_time__gte': from_date})
    invoice_form = timepiece_forms.InvoiceForm(request.POST or None,
                                               initial=initial)
    if request.POST and invoice_form.is_valid():
        invoice = invoice_form.save()
        entries = timepiece.Entry.no_join.filter_by_logged_in_user(request.user).filter(**entries_query)
        entries.update(status=invoice.status, entry_group=invoice)
        return HttpResponseRedirect(reverse('view_invoice', args=[invoice.pk]))
    else:
        entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(**entries_query)
        entries = entries.order_by('start_time')
        if not entries:
            raise Http404

    totals = timepiece.HourGroup.objects.summaries(entries)
    template = 'timepiece/time-sheet/invoice/confirm.html'
    return render_to_response(template, {
        'invoice_form': invoice_form,
        'entries': entries.select_related(),
        'project': project,
        'totals': totals,
        'from_date': from_date,
        'to_date': to_date,
    }, context_instance=RequestContext(request))


@permission_required('timepiece.change_entrygroup')
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
        project__type__billable=True, project__status__billable=True).values(
        'project__type__pk', 'project__type__label', 'project__name', 'hours',
        'project__pk', 'status', 'project__status__label', 'project__business__name',
    ).annotate(s=Sum('hours')).order_by('project__type__label',
                                        'project__name', 'status')
    return render_to_response(
        'timepiece/time-sheet/invoice/make_invoice.html', {
        'date_form': date_form,
        'project_totals': project_totals if to_date else [],
        'to_date': to_date - relativedelta(days=1) if to_date else '',
        'from_date': from_date,
    }, context_instance=RequestContext(request))


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
        return render_to_response(
            'timepiece/time-sheet/invoice/remove_invoice_entry.html',
            context,
            context_instance=RequestContext(request)
        )


@permission_required('timepiece.view_business')
@render_with('timepiece/business/list.html')
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
def view_business(request, business):
    business = get_object_or_404(timepiece.Business, pk=business)
    context = {
        'business': business,
    }
    return context


@permission_required('timepiece.add_business')
@render_with('timepiece/business/create_edit.html')
def create_edit_business(request, business=None):
    if business:
        business = get_object_or_404(timepiece.Business, pk=business)
    if request.POST:
        business_form = timepiece_forms.BusinessForm(
            request.POST,
            instance=business,
        )
        if business_form.is_valid():
            business = business_form.save()
            return HttpResponseRedirect(
                reverse('view_business', args=(business.pk,))
            )
    else:
        business_form = timepiece_forms.BusinessForm(
            instance=business
        )
    context = {
        'business': business,
        'business_form': business_form,
    }
    return context


@permission_required('auth.view_user')
@render_with('timepiece/person/list.html')
def list_people(request):
    form = timepiece_forms.SearchForm(request.GET)
    if form.is_valid() and 'search' in request.GET:
        search = form.cleaned_data['search']
        people = auth_models.User.objects.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search)
        )
        if people.count() == 1:
            url_kwargs = {
                'person_id': people[0].id,
            }
            return HttpResponseRedirect(
                reverse('view_person', kwargs=url_kwargs)
            )
    else:
        people = auth_models.User.objects.all().order_by('last_name')

    for person in people:
        key = "person_ctc_"+str(person.id)
        if key in request.POST.keys():
            timepiece.UserProfile.objects.get_or_create(user=person)
            person.save()
            person.profile.amount = float(request.POST[key])
            person.profile.save()
            break;

    for person in people:
        key = "person_amount_"+str(person.id)
        if key in request.POST.keys():
            timepiece.UserProfile.objects.get_or_create(user=person)
            person.save()
            person.profile.billable_amount = float(request.POST[key])
            person.profile.save()
            break;


    context = {
        'form': form,
        'people': people.select_related(),
    }
    return context


@permission_required('auth.view_user')
@transaction.commit_on_success
@render_with('timepiece/person/view.html')
def view_person(request, person_id):
    person = get_object_or_404(auth_models.User, pk=person_id)
    add_user_form = timepiece_forms.AddUserToProjectForm()
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


@permission_required('auth.add_user')
@permission_required('auth.change_user')
@render_with('timepiece/person/create_edit.html')
def create_edit_person(request, person_id=None):
    if person_id:
        person = get_object_or_404(auth_models.User, pk=person_id)
    else:
        person = None
    if request.POST:
        if person:
            person_form = timepiece_forms.EditPersonForm(
                request.POST,
                instance=person,
            )
        else:
            person_form = timepiece_forms.CreatePersonForm(request.POST,)
        if person_form.is_valid():
            person = person_form.save()
            return HttpResponseRedirect(
                reverse('view_person', args=(person.id,))
            )
        timepiece.UserProfile.objects.get_or_create(user=person)
        person.save()
    else:
        if person:
            person_form = timepiece_forms.EditPersonForm(
                instance=person,
            )
        else:
            person_form = timepiece_forms.CreatePersonForm()
            
    context = {
        'person': person,
        'person_form': person_form,
    }
    return context

@render_with('timepiece/project/detail.html')
def project_detail(request, business_id):
    if request.GET:
        form = timepiece_forms.ProjectSearchForm(request.GET)
    else:
        form = timepiece_forms.ProjectSearchForm({'status': u'5'})

    projects = timepiece.Project.objects.filter(business__id=business_id)
    try:
        business = timepiece.Business.objects.get(pk = business_id)
    except timepice.Business.DoesNotExist:
        raise PermissionDenied
    
    has_edit_project_detail = timepiece.BusinessPermissions.has_edit_project_detail(business,request.user)
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
    businesses = dict((b, business_total(p, from_date, to_date)) for b, p in businesses.iteritems())
    user_totals = {}
    for b in businesses.values():
        sum_user_totals(b['users_and_hours'], user_totals)

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
    

@permission_required('timepiece.view_project')
@render_with('timepiece/project/list.html')
def list_projects(request):
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

    projects = projects.annotate(end_time=Max('entries__end_time'), start_time=Min('entries__start_time'))
    
    total_outstanding_amount = 0
    total_outstanding_amounts_per_project = {}

    businesses = defaultdict(lambda: [])

    for project in projects:
        businesses[project.business.name].append(project)

    businesses = dict((b, business_total(p, from_date, to_date)) for b, p in businesses.iteritems())
    user_totals = {}
    for b in businesses.values():
        sum_user_totals(b['users_and_hours'], user_totals)

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

#     businesses = dict((b, business_total(p, from_date, to_date)) for b, p in businesses.iteritems())
#     user_totals = {}
#     for b in businesses.values():
#         sum_user_totals(b['users_and_hours'], user_totals)

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


def sum_user_totals(users_and_hours, totals=None):
    if totals is None:
        totals = {}

    def add_total(key):
        if key in business_totals:
            business_totals[key] += project_totals[key]
        else:
            business_totals[key] = project_totals[key]
    
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
            
            business_totals = user[business]['totals']

            add_total('hours')
            add_total('revenue')
            add_total('billed')
            
            business_totals['ctc_rate'] = float(business_totals['revenue']) / float(business_totals['hours'])
            business_totals['billed_rate'] = float(business_totals['billed'])  / float(business_totals['hours'])
    return totals
            
def business_total(projects, start_time=None, end_time=None):
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
    invoice_objects = timepiece.Invoice.objects.all()
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

        invoice = invoice_objects.filter(project=project).aggregate(amount=Sum('amount'))
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
              
@transaction.commit_on_success
@render_with('timepiece/project/view.html')
def view_project(request, project_id):
    project = get_object_or_404(timepiece.Project, pk=project_id)

    has_edit_project_detail = timepiece.BusinessPermissions.has_edit_project_detail(project.business,request.user)
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
@transaction.commit_on_success
def add_user_to_project(request, project_id):
    project = get_object_or_404(timepiece.Project, pk=project_id)
    if request.POST:
        form = timepiece_forms.AddUserToProjectForm(request.POST)
        if form.is_valid():
            user = form.save()
            timepiece.ProjectRelationship.objects.get_or_create(
                user=user,
                project=project,
            )
            
    if 'next' in request.REQUEST and request.REQUEST['next']:
        return HttpResponseRedirect(request.REQUEST['next'])
    else:
        return HttpResponseRedirect(
            reverse('view_project', args=(project.pk,)))


@csrf_exempt
@permission_required('timepiece.change_project')
@transaction.commit_on_success
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
    if 'next' in request.REQUEST and request.REQUEST['next']:
        return HttpResponseRedirect(request.REQUEST['next'])
    else:
        return HttpResponseRedirect(
            reverse('view_project', args=(project.pk,)))


@permission_required('timepiece.change_project')
@transaction.commit_on_success
@render_with('timepiece/project/relationship.html')
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
def create_close_project(request, project_id=None):
    project = get_object_or_404(timepiece.Project, pk=project_id)
    project.status = timepiece.Attribute.objects.get(label='closed', type='project-status')
    project.save()
    return HttpResponseRedirect(reverse('list_projects'))

@permission_required('timepiece.add_project')
@permission_required('timepiece.invoiced_project')
def invoiced_project(request, project_id=None):
    project = get_object_or_404(timepiece.Project, pk=project_id)
    project.status = timepiece.Attribute.objects.get(label='closed', type='project-status')
    project.billable = True
    project.save()
    timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(project=project).update(status='invoiced')
    return HttpResponseRedirect(reverse('list_projects'))

@permission_required('timepiece.add_project')
@permission_required('timepiece.unbillable_project')
def unbillable_project(request, project_id=None):
    project = get_object_or_404(timepiece.Project, pk=project_id)
    project.status = timepiece.Attribute.objects.get(label='closed', type='project-status')
    project.billable = False
    project.save()
    timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(project=project).update(status='invoiced')
    return HttpResponseRedirect(reverse('list_projects'))



@permission_required('timepiece.change_project')
@render_with('timepiece/project/create_edit.html')
def update_project(request, project_id=None):
    project = get_object_or_404(timepiece.Project, pk=project_id) \
        if project_id else None

    business_id = project.business.id

    form = timepiece_forms.ProjectForm(request.POST or None, instance=project)    
    if request.POST and form.is_valid():
        project = form.save()
        project.save()
        return HttpResponseRedirect(
            reverse('view_project', args=(project.id,))
            )

    context = {
        'project': project,
        'project_form': form,
    }
    return context

@permission_required('timepiece.add_project')
@render_with('timepiece/project/create_edit.html')
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
        return HttpResponseRedirect(
            reverse('view_project', args=(project.id,))
            )

    context = {
        'business':business,
        'project': project,
        'project_form': form,
    }
    return context


@render_with('timepiece/project/edit_project_budget.html')
def edit_project_budget(request, project_id=None):
    project = get_object_or_404(timepiece.Project, pk=project_id) \
        if project_id else None

    has_edit_budget = timepiece.BusinessPermissions.has_edit_budget(project.business,request.user)
    if not has_edit_budget:
        raise PermissionDenied
        
    form = timepiece_forms.ProjectBudgetForm(request.POST or None, instance=project)    
    if request.POST and form.is_valid():
        project = form.save()
        project.save()
        return HttpResponseRedirect(
            reverse('view_project', args=(project.id,))
            )

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
        profile_form = timepiece_forms.UserProfileForm(
            request.POST, instance=profile)
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            messages.info(request, 'Your settings have been updated')
            return HttpResponseRedirect(next_url)
    else:
        profile_form = timepiece_forms.UserProfileForm(instance=profile)
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
            extra_values=('activity', 'project__status')).filter(query)
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


class ProjectHoursView(ProjectHoursMixin, TemplateView):
    template_name = 'timepiece/hours/list.html'
    permissions = ('timepiece.can_clock_in',)

    def get_context_data(self, **kwargs):
        context = super(ProjectHoursView, self).get_context_data(**kwargs)

        form = timepiece_forms.ProjectHoursSearchForm(initial={
            'week_start': self.week_start
        })

        project_hours = utils.get_project_hours_for_week(self.week_start) \
            .filter(published=True)
        people = utils.get_people_from_project_hours(project_hours)
        id_list = [person[0] for person in people]
        projects = []

        for project, entries in groupby(project_hours, lambda o: o['project__id']):
            entries = list(entries)
            proj_id = entries[0]['project__id']
            name = entries[0]['project__name']
            row = [None for i in range(len(id_list))]
            for entry in entries:
                index = id_list.index(entry['user__id'])
                hours = entry['hours']
                row[index] = row[index] + hours if row[index] else hours
            projects.append((proj_id, name, row))

        context.update({
            'form': form,
            'week': self.week_start,
            'prev_week': self.week_start - relativedelta(days=7),
            'next_week': self.week_start + relativedelta(days=7),
            'people': people,
            'project_hours': project_hours,
            'projects': projects
        })

        return context


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
        return HttpResponse(json.dumps(data, cls=DecimalEncoder),
            mimetype='application/json')

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
            return HttpResponse(str(ph.pk), mimetype='text/plain')

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
                return HttpResponse('ok', mimetype='text/plain')

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
    
    if request.POST and 'copy_from_previous' in request.POST:
        salary.copy_from_previous()
        salary_form = timepiece_forms.SalaryForm(instance=salary)
    else:
        salary_form = timepiece_forms.SalaryForm(request.POST or None, instance=salary)

    user_form = timepiece_forms.QuickEditPersonForm(request.POST or None, instance=salary.user, prefix="user_form")

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
    return render_to_response(template, context, context_instance=RequestContext(request))

@permission_required('timepiece.can_change_salary')
def salary_payslip(request, salary_id, preview=True, template="timepiece/salary/payslip_pdf.html", context=None):
    context = context or {}
    salary = timepiece.Salary.objects.get(pk=salary_id)
    user = salary.user
    context.update( {'salary':salary, 'user':user} )

    preview = preview == True or str(preview) == '1'

    context['ytd'] = salary.ytd()
    context['leave'] = salary.leave_summary
    context['preview'] = preview
    response = render_to_response(template, context, context_instance=RequestContext(request))
    if not preview:
        html = response.content
        response = HttpResponse(render_to_pdf(html), mimetype='application/pdf')
        filename = "payslip_%s_%s.pdf" % (salary.user.username, salary.date.strftime("%b%Y"))
        response['Content-Disposition'] = 'attachment; filename="%s"' % filename

    return response

@permission_required('timepiece.view_entry_summary')
def incremental_timesheets_by_project(request, template="timepiece/time-sheet/redmine/incremental_timesheets_by_project.html", context=None):
    context = context or {}
    form = timepiece_forms.AggregatedTimesheetFormByProject(request.user, request.GET or None)
    if form.is_valid():
        report_args = form.save()
        report = report_helper.incremental_timesheets_by_project(**report_args)
        context['report'] = report
        csv_report = report_helper.convert_report_to_csv(report)
        response = HttpResponse(csv_report, mimetype="text/csv")
        response['Content-Disposition'] = 'attachment; filename="%s.csv"'%report_args['project'].name
        return response
            
    context['form'] = form
    return render_to_response(template, context, context_instance=RequestContext(request))

@csrf_exempt
@permission_required('timepiece.change_project')
@transaction.commit_on_success
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
def revenue(request, template="timepiece/time-sheet/reports/revenue.html", context=None):
    context = context or {}

    from_date, to_date = _get_filter_dates(request, context)

    entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(status='approved')
    entries = _apply_date_filter(request, entries, context)

    truncate_date = connection.ops.date_trunc_sql('month','start_time')
    entries = entries.extra({'month':truncate_date})
    entries = entries.values('month', 'project', 'user').annotate(Sum('hours')).order_by('month')
    context['entries'] = entries

    return render_to_response(template, context, context_instance=RequestContext(request))
    
def daily_graph(request, template="timepiece/graphs/daily_graph.html", context=None):

    if not request.user.is_superuser:
        return HttpResponse("")

    context = context or {}

    today = datetime.datetime.today().date()

    from_date, to_date =  _get_filter_dates_only(request, context, (today - relativedelta(months=1), today))

    daily_hours = {}
    for user in User.objects.all():
        daily_hours[user.username] = _get_daily_hours(timepiece.Entry.objects.filter(user=user), from_date, to_date)
    
    context['daily_hours'] = sorted((k,sorted(v.iteritems())) for k,v in daily_hours.iteritems() if v)
    context['from_date'] = from_date
    context['to_date'] = to_date

    return render_to_response(template, context, context_instance=RequestContext(request))

def graphs(request, template="timepiece/graphs/graph.html", context=None):
 
    if not request.user.is_superuser:
        return HttpResponse("")
 
    context = context or {}
 
    if request.GET:
        entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(status='approved').filter(project__users=request.user)
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

    return render_to_response(template, context, context_instance=RequestContext(request))

def _get_daily_hours(entries, from_date=None, to_date=None):
    hours = {}
    for entry in entries:
        d = datetime.date(year=entry.start_time.year, month=entry.start_time.month, day=entry.start_time.day)
        if from_date and to_date:
            if from_date > d or to_date < d: continue
        elif from_date:
            if from_date > d: continue
        elif to_date:
            if to_date < d: continue
        if d not in hours:
            hours[d] = entry.hours
        else:
            hours[d] += entry.hours
    return hours

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

    return render_to_response(template, context, context_instance=RequestContext(request))

def invoice_list(request, template='timepiece/invoice/index.html', context=None):
    
    context = context or {}

    project_id = request.GET.get('project_id')
    context['project'] = timepiece.Project.objects.get(pk=project_id)
    has_view_invoices = timepiece.BusinessPermissions.has_edit_invoices(context['project'].business,request.user)
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

    queryset = timepiece.Invoice.objects.filter(query)
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
    
    return render_to_response(template, context, context_instance=RequestContext(request))


@csrf_exempt
@permission_required('timepiece.change_project')
@transaction.commit_on_success
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
@transaction.commit_on_success
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
def time_sheet_download(request, user_id, context=None):
    context = context or {}
    to_date = datetime.datetime.strptime(request.GET['to_date'], "%Y%m%d").date()
    from_date = datetime.datetime.strptime(request.GET['from_date'], "%Y%m%d").date()
    entries = timepiece.Entry.objects.filter_by_logged_in_user(request.user).filter(start_time__gte=from_date).filter(end_time__lte=to_date)

    if int(user_id) > 0:
        entries = entries.filter(user__id=int(user_id))

    entries = entries.order_by("user__username").order_by("project__name").order_by("start_time")
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=entries_%s_%s.csv' % (request.GET['from_date'], request.GET['to_date'])
    writer = csv.writer(response)
    for entry in entries:
        writer.writerow( [ entry.user.username.encode("utf8"), entry.project.business.name.encode("utf8"), entry.project.name.encode("utf8"),
                           entry.start_time.strftime("%Y-%m-%d"), entry.hours, entry.comments.encode("utf8") ] )

    return response

def add_issue(request, project_id, template="timepiece/project/_add_issue_form.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]

    current_business = project.business
    
    context['next_issue_number'] = next_issue_number = timepiece.Issue.get_next_issue_number()
    context['project'] = project
    context['current_user'] = request.user
    current_user = request.user

    can_create_issue = timepiece.BusinessPermissions.has_add_issue(current_business, current_user)    
    if can_create_issue:
        new_issue_form = timepiece_forms.IssueForm(request.POST or None)
        if new_issue_form.is_valid():        
            issue = new_issue_form.save(commit=False)
            issue.number = next_issue_number
            issue.project = project            
            issue.status = 'new'
            issue.save()
            return get_issue_row(request, issue.id)

    context['new_issue_form'] = new_issue_form;
    return render_to_response(template, context, context_instance=RequestContext(request))

@csrf_exempt
def delete_issue(request, project_id, template="", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]
    current_business = project.business
    context['project'] = project

    current_user = request.user
    
    can_delete_issue = timepiece.BusinessPermissions.has_delete_issue(current_business, current_user)
    if can_delete_issue:
        try:
            edited_issue = timepiece.Issue.objects.get(pk=request.POST['item_id'])
            edited_issue.delete()
        except KeyError:
            edited_issue = None
            
            
    return HttpResponse("") 

def _augment_issue_data(issue,current_user):
    business_users = [user.id for user in issue.project.business.users]

    actual_billable_cost_of_issue = float(issue.billable)
    can_view_other_user_points = timepiece.BusinessPermissions.has_see_other_user_points(issue.project.business, current_user)     
    if can_view_other_user_points:
        users = timepiece.User.objects.filter(id__in = business_users)
    else:
        if timepiece.BusinessPermissions.has_estimate_own_points(issue.project.business, current_user):
            users = timepiece.User.objects.filter(id__in = [current_user.id])
        else:
            users = []
            
    for user in users:

        end = timings.start('user loop')
        
        per_user_issue_data = {}
        user_rate = issue.project.get_user_rate(user)
        user_rate = float(user_rate.amount) if user_rate else 0.0

        user_points = issue.get_user_issue_points(user)
        user_points_float = float(user_points.points) if user_points and user_points.points else 0.0

        per_user_issue_data["issue_points"] = user_points

        estimated_cost = user_points_float * user_rate
        completion = ((actual_billable_cost_of_issue / estimated_cost)*100) if estimated_cost>0 else 0.0

        per_user_issue_data["completion"] = completion
        per_user_issue_data["completion_width"] = completion
        if per_user_issue_data["completion_width"] >= 100:
            per_user_issue_data["completion_width"] = 100
            per_user_issue_data["bar_color"]= "traffic_red"
            per_user_issue_data["completion"] = 200 if per_user_issue_data["completion"] > 200 else per_user_issue_data["completion"] 
        elif per_user_issue_data["completion"] < 75:
            per_user_issue_data["bar_color"] = "traffic_green"
        else:
            per_user_issue_data["bar_color"] = "traffic_yellow"

        per_user_issue_data["has_estimate"] = per_user_issue_data["completion"]>0

        if not hasattr(issue.representation ,"per_user"):
            issue.representation.per_user = []
        issue.representation.per_user.append((user,per_user_issue_data))

        #_set_colour = lambda option: [option,'light_priority'] if option in  ['devdone','tested','task done'] else [option,'dark_priority']
        #options = map(_set_colour, [i[0] for i in timepiece.Issue.ISSUE_STATUS_CHOICES])
        #issue.representation.options = "[%s]"%",".join(["%s"%str(i) for i in options])
        #issue.representation.status_appearance = _set_colour(issue.status)[-1]
        options = [i[0] for i in timepiece.Issue.ISSUE_STATUS_CHOICES]
        issue.representation.options = "[%s]"%",".join(["'%s'"%str(i) for i in options])
        end()
    
@csrf_exempt
def project_issues(request, pk, template="timepiece/project/issues.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=pk).filter_by_logged_in_user(request.user)[0]
    business = project.business

    queryset = project.get_ordered_issues()
    issues_forms = timepiece_forms.issue_status_formset(request.POST or None, 
                                                        queryset=queryset)    
    for form in issues_forms.forms:
        _augment_issue_data(form.instance,request.user)
    
    new_issue_form = timepiece_forms.IssueForm()
    
    all_entries = project.entries.all().order_by("start_time")
    hours = 0
    ctc = 0
    billable = 0
    for entry in all_entries:
        hours += entry.hours
        ctc += entry.atrate
        billable += entry.atbillablerate
        
    rate = project.get_user_rate(request.user)
    context['next_issue_number']  = timepiece.Issue.get_next_issue_number()
    context['current_user_rate'] = float(rate.amount) if rate else 0.0
    context['business'] = business
    context['new_issue_form'] = new_issue_form
    context['current_user'] = request.user
    context['project'] = project
    context['unassigned_timesheet_entries_hours'] = timepiece.Issue.get_unassigned_timesheet_entries_hours(context['project'])
    context['unassigned_timesheet_entries_ctc'] = timepiece.Issue.get_unassigned_timesheet_entries_ctc(context['project'])
    context['unassigned_timesheet_entries_billable'] = timepiece.Issue.get_unassigned_timesheet_entries_billable(context['project'])

    context['issues_forms'] = issues_forms
    context['total_hours'] = hours
    context['total_ctc'] = ctc
    context['total_billable'] = billable

    timings.results()
    return render_to_response(template, context, context_instance=RequestContext(request))

@csrf_exempt
def issue_detail(request, issue_id, template="timepiece/project/issue_detail.html", context=None):
    context = context or {}
    issue =  timepiece.Issue.objects.get(pk=issue_id)
    context['issue'] = issue

    project = issue.project
    context['project'] = project

    context['business'] = project.business
    context['current_user'] = request.user

    return render_to_response(template, context, context_instance=RequestContext(request))

@csrf_exempt
def issue_detail_update(request,  template="timepiece/project/issue_detail.html", context=None):
    context = context or {}

    try:
        edited_issue = timepiece.Issue.objects.get(pk=request.POST['item_id'])
    except KeyError:
        edited_issue = None

    project = edited_issue.project
    context['project'] = project

    has_edit_description = timepiece.BusinessPermissions.has_edit_description(project.business, request.user)
    if not has_edit_description:
        raise PermissionDenied

    try:
        edited_issue.description = request.POST["new_value"]
        edited_issue.save()
    except KeyError:
        pass
                                                
    return HttpResponse("")

@csrf_exempt
def issue_status_update(request,  template="timepiece/project/issue_detail.html", context=None):
    context = context or {}

    try:
        edited_issue = timepiece.Issue.objects.get(pk=request.POST['item_id'])
    except KeyError:
        edited_issue = None

    project = edited_issue.project
    context['project'] = project

    has_edit_status = timepiece.BusinessPermissions.has_edit_issue_states(project.business, request.user)
    if not has_edit_status:
        raise PermissionDenied

    try:
        edited_issue.status = request.POST["new_value"]
        edited_issue.save()
    except KeyError:
        pass
                                                
    return HttpResponse("")


@csrf_exempt
def issue_subject_update(request,  template="timepiece/project/issue_detail.html", context=None):
    context = context or {}

    try:
        edited_issue = timepiece.Issue.objects.get(pk=request.POST['item_id'])
    except KeyError:
        edited_issue = None

    project = edited_issue.project
    context['project'] = project

    has_edit_subject = timepiece.BusinessPermissions.has_edit_subject(project.business, request.user)
    if not has_edit_subject:
        raise PermissionDenied
    try:
        edited_issue.subject = request.POST["new_value"]
        edited_issue.save()
    except KeyError:
        pass
    
    return HttpResponse("")


@csrf_exempt
@transaction.commit_on_success
def issue_points_update(request,  template="timepiece/project/issue_detail.html", context=None):
    try:
        edited_issue_points = timepiece.IssuePoints.objects.get(pk=request.POST['item_id'])
    except KeyError:
        edited_issue_points = None
        
    current_user = request.user
    these_are_the_current_user_points = (request.user.id == edited_issue_points.user.id)
    current_project = edited_issue_points.issue.project

    can_view_other_user_points = timepiece.BusinessPermissions.has_see_other_user_points(current_project.business,current_user)     
    edit_is_allowed = True if these_are_the_current_user_points or can_view_other_user_points else False
    if not edit_is_allowed:
        raise PermissionDenied
    try:
        edited_issue_points.points = request.POST["new_value"]
        edited_issue_points.save()
    except KeyError:
        pass
    
    return HttpResponse("")

@csrf_exempt
@permission_required('timepiece.change_project')
def unassigned_timesheet_entries(request, project_id, template="timepiece/project/issue_detail.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]
    context['current_user'] = request.user
    context['issue'] = {'id':'na',
                        'description':'unassigned timesheet entries',
                        'related_entries':timepiece.Issue.get_unassigned_timesheet_entries(project=project)}
    return render_to_response(template, context, context_instance=RequestContext(request))

@csrf_exempt
@permission_required('timepiece.change_project')
def all_timesheet_entries(request, project_id, template="timepiece/project/issue_detail.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]
    entries = project.entries.all().order_by("start_time")
    context['current_user'] = request.user
    context['issue'] = {'id':'na',
                        'description':'all timesheet entries',
                        'related_entries':entries}
    return render_to_response(template, context, context_instance=RequestContext(request))

@csrf_exempt
def view_project_rates(request, project_id, template="timepiece/project/view_rates.html", context=None):
    context = context or {}
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]
    has_view_ctc_billable_rates = timepiece.BusinessPermissions.has_view_ctc_billable_rates(project.business,request.user)
    if not has_view_ctc_billable_rates:
        raise PermissionDenied

    context['project'] = project
    context['users_and_hours'] = project.users_and_hours()
    context['recalculate_url'] = reverse(view_project_rates, args=[project_id])
    return render_to_response(template, context, context_instance=RequestContext(request))

@csrf_exempt
@permission_required('timepiece.change_project')
def edit_project_rate(request, project_id):
    project = timepiece.Project.objects.filter(pk=project_id).filter_by_logged_in_user(request.user)[0]
    user_name = request.POST['user_name']
    new_value = request.POST['update_value']
    field_name = request.POST['field_name']

    rate = project.get_user_rate(user_name)

    ret_val = None
    if field_name == 'amount':
        rate.amount = float(new_value)
        rate.save()
        ret_val = "R%s" % rate.amount
    elif field_name == "billable_amount":
        rate.billable_amount = float(new_value)
        rate.save()
        ret_val = "R%s" % rate.billable_amount
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
    return render_to_response(template, context, context_instance=RequestContext(request))

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
            if timepiece.Entry.objects.filter(user=profile.user,project=project).count()>0:
                timepiece.ProjectRelationship.objects.get_or_create(user=profile.user, project=project)

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

        per_business.setdefault(entry.project.business.name, {'ctc':0,'billable':0,'hours':0})
        per_business[entry.project.business.name]['ctc'] += entry.atrate
        per_business[entry.project.business.name]['billable'] += entry.atbillablerate
        per_business[entry.project.business.name]['hours'] += entry.hours

        per_user_per_business.setdefault(entry.user.username, {})
        per_user_per_business[entry.user.username].setdefault(entry.project.business.name, {'ctc':0,'billable':0,'hours':0})
        per_user_per_business[entry.user.username][entry.project.business.name]['ctc'] += entry.atrate
        per_user_per_business[entry.user.username][entry.project.business.name]['billable'] += entry.atbillablerate
        per_user_per_business[entry.user.username][entry.project.business.name]['hours'] += entry.hours
        
    context['ctc_total'] = ctc_total
    context['billable_total'] = billable_total
    context['per_user'] = per_user
    context['per_business'] = per_business
    context['per_user_per_business'] = per_user_per_business

    context['invoices_sent'] = timepiece.Invoice.objects.filter(Q(date_sent__gte=from_date)&Q(date_sent__lte=to_date))
    invoices_sent_total = 0
    for invoice in context['invoices_sent']:
        invoices_sent_total += invoice.amount
    context['invoices_sent_total'] = invoices_sent_total

    context['invoices_paid'] = timepiece.Invoice.objects.filter(Q(date_sent__gte=from_date)&Q(date_sent__lte=to_date))
    invoices_paid_total = 0
    for invoice in context['invoices_paid']:
        invoices_paid_total += invoice.amount
    context['invoices_paid_total'] = invoices_paid_total

    return render_to_response(template, context, context_instance=RequestContext(request))

@render_with('timepiece/project/show_timeline.html')
def show_timeline(request, project_id):
    context = {}

    def _clean_subject_name(issue_subject):
        return issue_subject.replace("\n","").strip()

    project = timepiece.Project.objects.get(id=project_id)
    issuedict = {}
    longest_issue_of_day = {}

    mindate = None
    maxdate = None
    global_max_total_hours = None
    for issue in project.issues.all():
        issue_entries = issue.related_entries

        if len(issue_entries) == 0:
            continue

        issue_subject = _clean_subject_name(issue.subject)
        issuedict[issue_subject] = issuedict.get(issue_subject,{})
        for entry in issue_entries:
            issue_total_hours_for_day = issuedict[issue_subject].get(entry.start_time,0)
            issuedict[issue_subject][entry.start_time.date()] = issue_total_hours_for_day +  float(entry.hours)
            
            if mindate is None or mindate > entry.start_time:
                 mindate = entry.start_time

            if maxdate is None or maxdate < entry.end_time:
                 maxdate = entry.end_time
    
   
    day_biggest_issue_dict  = {}                 
    day_dict = {}
    for issue in project.issues.all():
        issue_entries = issue.related_entries
        issue_subject = _clean_subject_name(issue.subject)
        if len(issue_entries) == 0:
            continue

        for entry in issue_entries:
            day_dict[entry.start_time] = day_dict.get(entry.start_time,{}) 
            day_dict[entry.start_time][issue_subject] = day_dict[entry.start_time].get(issue_subject,0) +  float(entry.hours)

    for day_start, daily_issue_info in sorted(day_dict.iteritems()):
        cur_max = 0
        for issue, duration in daily_issue_info.iteritems():
            if duration > cur_max:
                day_biggest_issue_dict[day_start] = issue
                cur_max = duration
               
    
    context['issue_entry'] = []
    for issue_subject,day_entry in  sorted(issuedict.items()):
        sorted_day_entry_items = sorted(day_entry.iteritems())
        element = [ issue_subject, sorted_day_entry_items ]
        max_elem = None
        for item in sorted_day_entry_items:
            if not max_elem or max_elem[-1] < item[-1]:
                max_elem = item
        if max_elem is not None:
            element.append(max_elem)
        context['issue_entry'].append(element)

    offset = datetime.timedelta(hours=24)
    context['issue_labels'] = [ (day-offset,name) for day, name in sorted(day_biggest_issue_dict.iteritems())] 
    context['from_date'] = mindate
    context['to_date'] = maxdate

    return context


@transaction.commit_on_success
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
        has_edit_permissions = timepiece.BusinessPermissions.has_edit_permissions(business,request.user)
        if not has_edit_permissions:
            raise PermissionDenied

        permission_forms.save()
        return HttpResponseRedirect(reverse('show_permissions', args=[business_id]))

    context['permission_forms'] = permission_forms

    context['permission_user_list'] = users

    context['last_project'] = timepiece.Project.most_recent_project(business.id)

    context['current_user']= request.user
    return context



@csrf_exempt
@login_required
@transaction.commit_on_success
def get_issue_row(request,issue_id):
    context = {}
    
    queryset = timepiece.Issue.objects.filter(pk=issue_id)
    project = queryset[0].project
    business = project.business

    issue = queryset[0].set_order()
    _augment_issue_data(issue,request.user)

    new_issue_form = timepiece_forms.IssueForm()

    all_entries = project.entries.all().order_by("start_time")
    hours = 0
    ctc = 0
    billable = 0
    for entry in all_entries:
        hours += entry.hours
        ctc += entry.atrate
        billable += entry.atbillablerate
        
    rate = project.get_user_rate(request.user)
    context['current_user_rate'] = float(rate.amount) if rate else 0.0
    context['business'] = business
    context['new_issue_form'] = new_issue_form
    context['current_user'] = request.user
    context['project'] = project
    context['unassigned_timesheet_entries_hours'] = timepiece.Issue.get_unassigned_timesheet_entries_hours(context['project'])
    context['unassigned_timesheet_entries_ctc'] = timepiece.Issue.get_unassigned_timesheet_entries_ctc(context['project'])
    context['unassigned_timesheet_entries_billable'] = timepiece.Issue.get_unassigned_timesheet_entries_billable(context['project'])
    context['total_hours'] = hours
    context['total_ctc'] = ctc
    context['total_billable'] = billable
    refresh_issue =timepiece.Issue.objects.get(id=issue.id)
    refresh_issue.representation = issue.representation
    context['issue'] = refresh_issue
    r = render_to_response('timepiece/project/_issue_entry_row.html',
                           context, context_instance=RequestContext(request))
    return r

@csrf_exempt
@login_required
@transaction.commit_on_success
def sortable_update(request):
    context = {}

    ordered_issue_ids = []
    for index in request.POST['ordered_ids'].split(","):
        try:
            int_index = int(index)
            ordered_issue_ids.append(int_index)
        except ValueError:
            continue

    project_id = request.POST['project_id']
    issue_query_set = timepiece.Issue.objects.filter(project__id = project_id).order_by("order")

    for item_order_count, issue_id in enumerate(ordered_issue_ids):
        issue = timepiece.Issue.objects.get(pk=issue_id)
        issue.order = item_order_count
        issue.save()
    
    return HttpResponse("")

