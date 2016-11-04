from invoicing import models
from django.db.models import Sum, Count, Q, F, Max, Min
from django.utils.datastructures import SortedDict
from dateutil.relativedelta import relativedelta
from phantom_pdf.generator import create_url_from_query_dict, render_url_to_pdf
from timepiece import models as timepiece
from django.core.files.base import ContentFile
from django.contrib.auth import login as django_login, load_backend
from django.shortcuts import render_to_response, get_object_or_404, redirect, render
from django.contrib.auth.decorators import login_required, permission_required
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse, resolve
from django.template import RequestContext
from django.contrib import messages
from django.contrib.auth.models import User
import datetime
import random
import math
import json

@login_required
def home(request):
    # slides = [ 'timesheets', 'ratios' ]
    slides = ['timesheets']

    prev_slide_index = request.session.get('previous_slide_index', 0)
    slide_index = prev_slide_index + 1
    if slide_index >= len(slides):
        slide_index = 0

    slide = slides[slide_index]
    request.session['previous_slide_index'] = slide_index
    return redirect(reverse('slideshow:' + slide))


@login_required
def timesheets(request, template="slideshow/timesheets.html", context=None):
    context = context or {}

    users = User.objects.all().filter(is_active=True, is_staff=True).exclude(username="us")
    today = datetime.datetime.today().date()

    from_date = today - relativedelta(days=14)
    from_date = from_date.replace(day=1)

    to_date = today

    daily_hours = {}
    for user in users:
        entries = timepiece.Entry.objects.filter(user=user)
        daily_hours[user.username] = {'daily_hours': {}, 'weekly_average': {}}
        daily_hours[user.username].update(_get_daily_hours(user, entries, from_date, to_date))
        daily_hours[user.username]['required_average'] = user.profile.required_daily_work_hours

        context['daily_hours'] = daily_hours
        context['from_date'] = from_date
        context['to_date'] = to_date

    return render_to_response(template, context, context_instance=RequestContext(request))


@login_required
def progress(request, template="slideshow/progress.html", context=None):
    context = context or {}

    projects = timepiece.Project.objects.filter_open().order_by('business_id', 'order')

    plot_data = {}
    business_list = {}

    for project in projects:
        business = project.business
        business_id = business.id

        stats = project.calculate_new_stats(request.user)
        manager_rate = stats['per_role']['manager']['hours_billable_core_rate']
        developer_rate = stats['per_role']['developer']['hours_billable_core_rate']
        tester_rate = stats['per_role']['tester']['hours_billable_core_rate']
        spendable_budget = project.spendable_budget

        if not plot_data.has_key(business_id):
            plot_data[business_id] = []

        if spendable_budget == 0:
            ratio = 0
        else:
            ratio = 100 / spendable_budget

        values = {
            'manager_rate': calculate_progress_ratio(manager_rate, ratio),
            'developer_rate': calculate_progress_ratio(developer_rate, ratio),
            'tester_rate': calculate_progress_ratio(tester_rate, ratio),
            'has_budget': spendable_budget > 0
        }

        plot_data[business_id].append({'project': project.name, 'values': values})
        business_list[business] = True

    context['business_list'] = business_list
    context['plot_data_json'] = json.dumps(plot_data)

    # import pdb; pdb.set_trace()

    return render_to_response(template, context, context_instance=RequestContext(request))

def calculate_progress_ratio(rate, ratio):
    value = round(rate * ratio, 2)
    return value if value < 100 else 100

@login_required
def ratios(request, template="slideshow/ratios.html", context=None):
    context = context or {}
    _populate_ratios(context)
    return render_to_response(template, context, context_instance=RequestContext(request))


def _populate_ratios(context):
    context['recent_ratios_per_project'] = {}
    from_date = datetime.datetime.today().date() - relativedelta(days=30)

    entries = timepiece.Entry.objects.filter(start_time__gte=from_date)
    total_hours = entries.aggregate(hours=Sum('hours'))['hours']
    times_per_project = entries.order_by("-issue__project__business__name").values(
        'issue__project__business__name').annotate(hours=Sum('hours'))
    context['recent_ratios_per_project'] = [{'business': x['issue__project__business__name'], 'hours': x['hours'],
                                             'ratio': float(x['hours']) / float(total_hours)} for x in
                                            times_per_project]


def _get_daily_hours(user, entries, from_date=None, to_date=None):
    entries = entries.filter(start_time__gte=from_date, start_time__lte=to_date).extra({'on_day': 'date(start_time)'})
    entries_hours_per_day = entries.values('on_day').order_by("on_day").annotate(total_hours=Sum('hours'))
    daily_hours_by_project = entries.values('on_day', 'issue__project__business__name',
                                            'issue__project__name').order_by("on_day", "issue__project__business__name",
                                                                             "issue__project__name").annotate(
        total_hours=Sum('hours'))

    hours_per_day = {}
    for entry_hours_per_day in entries_hours_per_day:
        hours_per_day[entry_hours_per_day['on_day']] = entry_hours_per_day['total_hours']

    hours = SortedDict()
    daily_average_hours_per_week = SortedDict()
    daily_average_hours_per_month = SortedDict()

    running_date = from_date
    running_hours_per_week = 0
    running_days_in_week = 0
    running_hours_per_month = 0
    running_days_in_month = 0

    total_hours_by_month = SortedDict()

    month_date = running_date.replace(day=1)
    total_hours_by_month[month_date] = {'total_available_hours_per_month': 0,
                                        'total_worked_hours_per_month': 0}
    while running_date <= to_date:

        hours_this_day = hours_per_day.get(running_date, 0)
        hours[running_date] = hours_this_day

        if running_date.weekday() == 0:
            running_days_in_week = 0
            running_hours_per_week = 0
        if running_date.day == 1:
            running_days_in_month = 0
            running_hours_per_month = 0
            month_date = running_date.replace(day=1)
            total_hours_by_month[month_date] = {'total_available_hours_per_month': 0,
                                                'total_worked_hours_per_month': 0}

        running_hours_per_week += hours_this_day
        running_hours_per_month += hours_this_day
        total_hours_by_month[month_date]['total_worked_hours_per_month'] += hours_this_day

        if not timepiece.Holiday.is_a_holiday(running_date) and not timepiece.CalendarEvent.is_on_leave(running_date,
                                                                                                        user):
            running_days_in_week += 1
            running_days_in_month += 1
            total_hours_by_month[month_date][
                'total_available_hours_per_month'] += user.profile.required_daily_work_hours

        daily_average_hours_per_week[running_date] = float(running_hours_per_week) / (running_days_in_week or 1)
        daily_average_hours_per_month[running_date] = float(running_hours_per_month) / (running_days_in_month or 1)
        running_date += relativedelta(days=1)

    return {'daily_hours': hours,
            'weekly_average': daily_average_hours_per_week,
            'monthly_average': daily_average_hours_per_month,
            'daily_hours_by_project': daily_hours_by_project,
            'total_hours_by_month': total_hours_by_month}
