from invoicing import models
from django.db.models import Sum, Count, Q, F, Max, Min
from collections import OrderedDict
from dateutil.relativedelta import relativedelta
from phantom_pdf.generator import create_url_from_query_dict, render_url_to_pdf
from timepiece import models as timepiece
from django.core.files.base import ContentFile
from django.contrib.auth import login as django_login, load_backend
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth.decorators import login_required, permission_required
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse, resolve
from django.template import RequestContext
from django.contrib import messages
from django.contrib.auth.models import User
from  operator import itemgetter
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

    return render(request, template, context)


@login_required
def progress(request, template="slideshow/progress.html", context=None):
    context = context or {}

    business_list = OrderedDict()
    business_proj_list = []

    projects = timepiece.Project.objects.filter().filter_open().filter_in_dev_or_pending()\
        .order_by('business_id', 'order')

    plot_data = {}


    # ##
    # projects = projects.filter(business__name='bundlebrat')
    # ##

    for project in projects:
        business = project.business
        business_id = business.id
        if not plot_data.has_key(business_id):
            plot_data[business_id] = []

        dev_stats = calculate_dev_hours_stats(project, request.user)
        dev_hours_available, dev_hours_used, ratio, manager_rate, developer_rate, tester_rate = dev_stats

        values = {
            'manager_rate': calculate_progress_ratio(manager_rate, ratio),
            'developer_rate': calculate_progress_ratio(developer_rate, ratio),
            'tester_rate': calculate_progress_ratio(tester_rate, ratio),
            'has_budget': project.spendable_budget > 0,
            'dev_hours_available': dev_hours_available
        }

        point_person = project.point_person.first_name + ' ' +  project.point_person.last_name

        plot_data[business_id].append({'project': project.name, 'values': values,
                                       'point_person': point_person,'dev_hours_used': dev_hours_used })
        #business_list[business] = True

        if project.business.point_person:
            point_person_name = project.business.point_person.last_name
        else:
            point_person_name = "unknown"
            
        business_proj_list.append([point_person_name, business.name ,business])

    business_proj_list.sort(key=itemgetter(0,1))

    for bus_data in business_proj_list:
        business_list[bus_data[2]] = True

    context['business_list'] = business_list
    context['plot_data_json'] = json.dumps(plot_data)

    return render(request, template, context)

def calculate_progress_ratio(rate, ratio):
    value = round(rate * ratio, 2)
    return value if value < 100 else 100

def calculate_dev_hours_stats(project, user):
    stats = project.calculate_new_stats(user)
    spendable_budget = project.spendable_budget

    # manager_rate = stats['per_role']['manager']['hours_billable_core_rate']
    # developer_rate = stats['per_role']['developer']['hours_billable_core_rate']
    # tester_rate = stats['per_role']['tester']['hours_billable_core_rate']

    manager_rate = stats['per_role']['manager']['average_billable_rate']
    developer_rate = stats['per_role']['developer']['average_billable_rate']
    tester_rate = stats['per_role']['tester']['average_billable_rate']

    try:
        this_users_rate = stats['per_user'][user]['rate'].full_rate
    except KeyError:
        this_users_rate = 0

    manager_ratio = project.time_ratio_for_role('manager')
    developer_ratio = project.time_ratio_for_role('developer')
    tester_ratio = project.time_ratio_for_role('tester')

    #users_rate = stats['per_user'][user]['rate'].full_rate  #   user stats['per_role']['developer']['hours_billable_core_rate']

    if spendable_budget == 0:
       #spendable_budget = 1
       ratio = 0
    else:
       ratio = 100 / float(spendable_budget)

    budget_used = stats['total']['hours_billable_core_rate']
    budget_available = spendable_budget - budget_used

    # calculate the total time by reworking the formula:
    #  : dev_time*dev_rate + tester_time*tester_rate + manager_time*manager_rate = budget
    # with the substitution:
    #  : xxx_time = total_time*xxx_time_ratio
    #
    # _tt = project.time_ratio_for_role('tester')*float(stats['per_role']['tester']['average_billable_rate'])
    # _mm = project.time_ratio_for_role('manager')*float(stats['per_role']['manager']['average_billable_rate'])
    _b = budget_available
    # _d_rate = float(users_rate)
    # _d_ratio = project.time_ratio_for_role('developer')

    try:
        remaining_time = _b / ( (manager_ratio*manager_rate) + (developer_ratio*this_users_rate) + (tester_ratio*tester_rate) )
    except ZeroDivisionError:
        remaining_time = 0

    # if _d_rate > 0:
    #     remaining_time = _b/_d_rate * (1 / (_tt/_d_rate + _mm/_d_rate + _d_ratio))
    # else:
    #     remaining_time = 0

    remaining_users_time = developer_ratio * remaining_time
    try:
        dev_hours_used = stats['per_user'][user]['hours_billable']
    except KeyError:
        dev_hours_used = 0

    return remaining_users_time, dev_hours_used, ratio, manager_rate, developer_rate, tester_rate

@login_required
def ratios(request, template="slideshow/ratios.html", context=None):
    context = context or {}
    _populate_ratios(context)
    return render(request, template, context)


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

    hours = OrderedDict()
    daily_average_hours_per_week = OrderedDict()
    daily_average_hours_per_month = OrderedDict()

    running_date = from_date
    running_hours_per_week = 0
    running_days_in_week = 0
    running_hours_per_month = 0
    running_days_in_month = 0

    total_hours_by_month = OrderedDict()

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
