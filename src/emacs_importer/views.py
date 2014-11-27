from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect
import os
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


