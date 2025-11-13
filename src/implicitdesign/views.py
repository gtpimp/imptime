
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse, resolve
from django.contrib.auth.decorators import user_passes_test
from operator import itemgetter
from django import template
import os
import csv
from django.core.mail import EmailMessage
from io import StringIO
from implicitdesign import settings
from zipfile import ZipFile
from django.template import RequestContext
from emacs_importer.process_for_timepiece import Processor
from django.contrib.auth import authenticate
from django.contrib.auth import login as django_login
from implicitdesign.forms import ImpAuthenticationForm
from datetime import datetime
from rest_framework.authtoken.models import Token as RestFrameworkToken
import logging
from collections import OrderedDict
logger = logging.getLogger(__name__)

def home(request, template="home.html", context=None):
    if hasattr(request, 'user'):
        return HttpResponseRedirect(reverse("landing_page"))
    else:
        return HttpResponseRedirect(reverse("auth_login"))


def primary_login(request, template="registration/login.html", context=None):
    context = context or {}
    form = ImpAuthenticationForm(request.POST or None)
    if form.is_valid():
        user = authenticate(username=form.cleaned_data['username'],
                            password=form.cleaned_data['password'])
        if user is not None:
            django_login(request, user)
            RestFrameworkToken.objects.filter(user=user).delete()
            RestFrameworkToken.objects.get_or_create(user=user)
            return HttpResponseRedirect(request.GET.get('next', "/"))
        else:
            context['errors'] = 'Invalid login credentials'
            
    context['form'] = form
    return render(request, template, context)
        

def error_handler_400(request, template="error_base.html", context=None):
    context = context or {}
    response = render(request, template, context)
    response.status_code = 400
    return response

def error_handler_403(request, template="error_base.html", context=None):
    context = context or {}
    response = render(request, template, context)
    response.status_code = 403
    return response

def error_handler_404(request, template="404.html", context=None):
    context = context or {}
    response = render(request, template, context)
    response.status_code = 404
    return response

def error_handler_500(request, template="500.html", context=None):
    context = context or {}
    response = render(request, template, context)
    response.status_code = 500
    return response

@user_passes_test(lambda u: u.is_superuser)
def us(request, template="home.html", context=None):
    context = context or {}
    return render(request, template, context)

@user_passes_test(lambda u: u.is_superuser)
def staff_daylies(request, template="staff_daylies.html", context=None):
    return render_staff_daylies(request=request, template=template, context=context)

@user_passes_test(lambda u: u.is_superuser)
def render_staff_daylies(request=None, template="staff_daylies.html", context=None):
    context = context or {}

    daylies = {}
    for username in settings.EMACS_USERS_TO_PROCESS:
        processor_kwargs = { 'user': username,
                             'root_folder': settings.EMACSIMPORTER_TIMESHEET_ROOT_FOLDER,
                             'num_historical_days': 14,
                             'pointperson_username': settings.EMACSIMPORTER_POINTPERSON_USERNAME,
                             'rates_info': settings.EMACSIMPORTER_RATES,
                             'day_step':True,
                             'maxlevel':1 }
        processor = Processor(**processor_kwargs)
        user_daylies = processor.generate_staff_daylies()
        dates = sorted(user_daylies.keys())
        sorted_daylies = OrderedDict()
        for date in dates:
            sorted_daylies[date] = user_daylies[date]
        daylies[username] = sorted_daylies

    context['daylies'] = daylies
    if request is not None:
        context_instance=RequestContext(request)
    else:
        context_instance = None
    return render(request, template, context)

@user_passes_test(lambda u: u.is_superuser)
def generate_incremental_timesheet(request, template="generate_incremental_timesheet.html", context=None):
    context = context or {}

    try:
        if request.POST:
            from_date = datetime.strptime(request.POST['date_from'], '%Y-%m-%d')
            to_date = datetime.strptime(request.POST['date_to'], '%Y-%m-%d')
            client = request.POST['client']
            username = request.POST['username']
            timesheet_type = request.POST['timesheet_type']
            display_type = request.POST['display_type']
            email_to = request.POST['email_to']
            email_subject = request.POST['email_subject']

            context['from_date'] = from_date
            context['to_date'] = to_date
            context['client'] = client
            context['username'] = username
            context['timesheet_type'] = timesheet_type
            context['display_type'] = display_type
            context['email_to'] = email_to
            context['email_subject'] = email_subject

            if timesheet_type == 'issues':
                day_step = True
            elif timesheet_type == 'org':
                day_step = False
            else:
                raise Exception("Unknown timesheet_type: %s" % timesheet_type)

            processor_kwargs = { 'user': username,
                                 'user_email': 'gtp@implicitdesign.co.za',
                                 'root_folder': settings.EMACSIMPORTER_TIMESHEET_ROOT_FOLDER,
                                 'email_from': settings.EMACSIMPORTER_EMAIL_FROM,
                                 'num_historical_days': settings.EMACSIMPORTER_NUM_HISTORICAL_DAYS,
                                 'pointperson_username': settings.EMACSIMPORTER_POINTPERSON_USERNAME,
                                 'rates_info': settings.EMACSIMPORTER_RATES,
                                 'day_step':day_step,
                                 'maxlevel':4
                                 }

            processor = Processor(**processor_kwargs)
            processor.generate_incremental(from_date=from_date,
                                           to_date=to_date,
                                           only_these_files=["%s.org" % client],
                                           import_clocktable_entries=False)

            try:
                if timesheet_type == 'org':
                    clocktable_raw = _generate_org_clocktable(processor)
                elif timesheet_type == 'issues':
                    if display_type == 'screen':
                        clocktable_raw = _generate_issues_clocktable_html(processor)
                    elif display_type == 'download':
                        clocktable_raw = _generate_issues_clocktable_csv(processor)
                    else:
                        raise Exception("Unknown display_type: %s" % display_type)
                else:
                    raise Exception("Unknown timesheet_type: %s" % timesheet_type)
            except IndexError:
                return HttpResponse("Invalid username or clientname: %s" % username)

            clocktable_raw = "User=%s\nClient=%s\nFrom=%s , To=%s\n%s" % (str(username), str(client), from_date.strftime("%Y-%m-%d"), to_date.strftime("%Y-%m-%d"), clocktable_raw.decode('ascii', 'ignore').encode('ascii', 'ignore'))


            filename = "%s_%s.csv" % (username, client)
            if display_type == 'download':
                response = HttpResponse(clocktable_raw)
                response['Content-Disposition'] = 'attachment; filename="%s"' % filename
            elif display_type == 'screen':
                context['timesheet_entries'] = clocktable_raw
                response = render(request, template, context)

            if len(email_to.strip())>0:
                email = EmailMessage('%s: %s %s. %s -> %s' % (email_subject, username, client, from_date.strftime("%Y-%m-%d"), to_date.strftime("%Y-%m-%d")),
                                     'Attached', 'gtp@implicitdesign.co.za',
                                     email_to.split(","), [],
                                     headers = {'Reply-To': 'gtp@implicitdesign.co.za'})
                email.attach(filename, clocktable_raw)

                clocktable_file = os.path.join(settings.EMACSIMPORTER_TEMP_DIR, filename)
                with open(clocktable_file, "w") as f:
                    f.write(clocktable_raw)
                zip_file = os.path.join(settings.EMACSIMPORTER_TEMP_DIR, filename) + ".zip"
                z = ZipFile(zip_file, 'w')
                z.write(clocktable_file)
                z.close()
                email.attach(filename + ".zip", open(zip_file).read())

                email.send()

            return response
        else:
            return render(request, template, context)
    except Exception as ex:
        logger.exception(ex)
        context['error'] = str(ex)
        return render(request, template, context)

def _generate_org_clocktable(processor):
    clocktable_raw = processor.clocktable_raws[0]
    clocktable_raw = clocktable_raw.replace(","," ").replace("|",",") #make friendly for csv
    return clocktable_raw


def _generate_issues_clocktable_csv(processor):
    s = StringIO.StringIO()
    c = csv.writer(s)
    context = _generate_issues_clocktable_common(processor)
    c.writerow(context['heading'])
    for row in context['rows']:
        c.writerow(row)
    c.writerow( [] )
    c.writerow( context['footer'] )
    return s.getvalue()

def _generate_issues_clocktable_html(processor):
    context = _generate_issues_clocktable_common(processor)
    t = template.loader.get_template("issues_clocktable.html")
    return t.render(template.Context(context)).encode('ascii', 'ignore')

def _generate_issues_clocktable_common(processor):
    context = {}
    context['heading'] = ['business', 'sprint', 'issue_category', 'issue_id', 'username', 'date', 'hours', 'description']
    context['rows'] = []
    total_hours = 0

    entries = processor.status['issue_clocktable_entries']
    entries = sorted(entries, key=itemgetter('sprint'))

    for entry in entries:
        values = [ entry[x] for x in context['heading'] ]
        context['rows'].append(values)
        total_hours += entry['hours']
    context['footer'] = ['', '', '', '', '', '', total_hours, 'TOTAL HOURS']

    return context

def robots(request, template="robots.txt"):
    context = {}
    return render(request, template, context)
