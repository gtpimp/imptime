from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
import os
import pprint
from implicitdesign import settings
from django.contrib.auth.decorators import login_required, permission_required
from tasks import import_timesheets_from_emacs_task, import_timesheets_from_emacs
from django.utils import simplejson

@login_required
def do_import(request, template="import.html", context=None):
    context = context or {}

    if 'immediate' in request.GET:
        status = import_timesheets_from_emacs()
        context['status_msg'] = pprint.pformat(status, indent=2).replace(" ","&nbsp;").replace("\n", "<br/>")
        context['msg'] = 'import task run'
    else:
        task = import_timesheets_from_emacs_task.delay()
        context['msg'] = 'delayed import task started : current result is %s' % task.result

    return render_to_response(template, context, context_instance=RequestContext(request))

