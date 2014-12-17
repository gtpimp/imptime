from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseRedirect
from extract_for_timepiece import Extractor
import os
from forms import ImportTimesheetForm
from django.core.mail import send_mail
import pprint
from implicitdesign import settings
from django.contrib.auth.decorators import login_required, permission_required
from tasks import import_timesheets_from_emacs_task, import_timesheets_from_emacs
from django.utils import simplejson
from django.contrib.auth.decorators import user_passes_test
from django.core import management
import threading

@login_required
@user_passes_test(lambda u: u.is_superuser)
def import_timesheets(self):
    
    def go():
        try:
            management.call_command('import_timesheet', verbosity=0, interactive=False)
        except Exception, ex:
            send_mail(subject="Problems importing timesheets",
                      message=str(ex),
                      from_email="info@implicitdesign.co.za",
                      recipient_list=["gtp@implicitdesign.co.za",],
                      fail_silently=True)

    t = threading.Thread(target=go)
    t.daemon=True
    t.start()
    return HttpResponse("Timesheet import started. It can take up to an hour or so, you will receive an email when it's complete.<br/>Don't start a new import until the previous one has completed")

@csrf_exempt
def import_timesheet(request):
    form = ImportTimesheetForm(request.POST or None)
    if form.is_valid():
        the_extractor = Extractor(username=form.cleaned_data['username'])
        status = the_extractor.extract_for_filecontent(filename=form.cleaned_data['filename'],
                                                        file_content=form.cleaned_data['filecontent'])
        return HttpResponse(json.dumps({'status':status,
                             'msg':"Single file import of %s complete." % (form.cleaned_data['filename'])}))

    return HttpResponse("Validation error: %s" % form.errors)
