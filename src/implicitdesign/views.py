from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse
import os
from django.core.mail import EmailMessage
import settings
from zipfile import ZipFile
from django.template import RequestContext
from emacs_importer.process_for_timepiece import Processor
from datetime import datetime

def home(request, template="home.html", context=None):
    context = context or {}
    return render_to_response(template, context, context_instance=RequestContext(request))

def timesheet_graphs(request):
    pass
    
def generate_incremental_timesheet(request, template="generate_incremental_timesheet.html", context=None):
    context = context or {}

    if request.POST:
        from_date = datetime.strptime(request.POST['date_from'], '%Y-%M-%d')
        to_date = datetime.strptime(request.POST['date_to'], '%Y-%M-%d')
        client = request.POST['client']
        username = request.POST['username']
        email_to = request.POST['email_to']

        processor_kwargs = { 'user': username,
                             'user_email': 'gtp@implicitdesign.co.za',
                             'root_folder': settings.EMACSIMPORTER_TIMESHEET_ROOT_FOLDER,
                             'email_from': settings.EMACSIMPORTER_EMAIL_FROM,
                             'num_historical_days': settings.EMACSIMPORTER_NUM_HISTORICAL_DAYS,
                             'pointperson_username': settings.EMACSIMPORTER_POINTPERSON_USERNAME,
                             'rates_info': settings.EMACSIMPORTER_RATES,
                             'step':"",
                             'maxlevel':4
                             }
        processor = Processor(**processor_kwargs)
        processor.generate_incremental(from_date=from_date, 
                                       to_date=to_date,
                                       only_these_files=["%s.org" % client], 
                                       import_clocktable_entries=False)
        try:
            clocktable_raw = processor.clocktable_raws[0]
        except IndexError:
            return HttpResponse("Invalid username or clientname: %s" % username)

        clocktable_raw = clocktable_raw.replace(","," ").replace("|",",") #make friendly for csv
        clocktable_raw = "User=%s\nClient=%s\nFrom=%s , To=%s\n%s" % (username, client, from_date.strftime("%Y-%M-%d"), to_date.strftime("%Y-%M-%d"), clocktable_raw)

        response = HttpResponse(clocktable_raw)
        filename = "%s_%s.csv" % (username, client)
        response['Content-Disposition'] = 'attachment; filename="%s"' % filename

        if len(email_to.strip())>0:
            email = EmailMessage('Incremental timesheet: %s %s' % (username, client), 'Attached', 'gtp@implicitdesign.co.za',
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
        return render_to_response(template, context, context_instance=RequestContext(request))