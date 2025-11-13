from django.shortcuts import get_object_or_404, render
from django.template import RequestContext
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseRedirect
from emacs_importer.extract_for_timepiece import Extractor
from django.db import transaction
import os
from emacs_importer.forms import ImportTimesheetForm
from django.core.mail import send_mail
import pprint
from django.conf import settings
from django.contrib.auth.decorators import login_required, permission_required
from emacs_importer.tasks import import_timesheets_from_emacs_task, import_timesheets_from_emacs
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.models import User
from django.core import management
from timepiece.models import Project
import threading
import logging
logger = logging.getLogger(__name__)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def import_timesheets(self):
    
    def go():
        try:
            management.call_command('import_timesheet', verbosity=0, interactive=False)
        except Exception as ex:
            send_mail(subject="Problems importing timesheets",
                      message=str(ex),
                      from_email=settings.FROM_EMAIL,
                      recipient_list=["gtp@implicitdesign.co.za",],
                      fail_silently=True)

    t = threading.Thread(target=go)
    t.daemon=True
    t.start()
    return HttpResponse("Full timesheet import started. It can take up to an hour or so, you will receive an email when it's complete.<br/>Don't start a new import until the previous one has completed")

@csrf_exempt
def import_timesheet(request):
    form = ImportTimesheetForm(request.POST or None, request.FILES or None)
    if form.is_valid():
        username=form.cleaned_data['username']
        try:
            mail_to = set()
            mail_to.update(settings.EMACS_ADMIN_USER_EMAILS)
            user = User.objects.get(username=username)
            mail_to.update([user.email])
            mail_to = list(mail_to)

            the_extractor = Extractor(username=username)

            status = {'errors': [], 'infos': []}
            try:
                with transaction.atomic():
                    status = the_extractor.extract_for_filecontent(filename=form.filename,
                                                                   file_content=form.filecontent)
                    if len(status['errors'])>0:
                        raise Exception("Importer failed")
            except Exception as ex:
                logger.exception(ex)
                status['errors'].append(str(ex))            

            if len(status.get('errors', [])) > 0:
                for error in status['errors']:
                    logger.error("Error importing timesheet for %s : %s - %s" %(username, form.filename, error))
                    
                send_mail(subject="Errors importing timesheet for %s : %s" %(username, form.filename),
                          message="\n".join(status['errors']),
                          from_email=settings.FROM_EMAIL,
                          recipient_list=mail_to,
                          fail_silently=False)

            # elif len(status.get('infos', [])) > 0:
            #     send_mail(subject="Warnings importing timesheet for %s : %s" %(username, form.filename),
            #               message="\n".join(status['infos']),
            #               from_email=settings.FROM_EMAIL,
            #               recipient_list=mail_to,
            #               fail_silently=False)
            
            return HttpResponse(json.dumps({'status':status,
                                            'msg':"Single file import of %s complete." % (form.filename)}))
        except Exception as ex:
            logger.exception(ex)
            send_mail(subject="Problems importing timesheet for %s : %s" %(username, form.filename),
                      message=str(ex),
                      from_email=settings.FROM_EMAIL,
                      recipient_list=settings.EMACS_ADMIN_USER_EMAILS,
                      fail_silently=True)
            return HttpResponse(json.dumps({'status':'failed', 'msg': str(ex)}))

    return HttpResponse("Validation error: %s" % form.errors)

@login_required
def export_project_to_emacs(request, project_id, template="emacs_importer/export_to_org_mode.org", context=None):
    context = context or {}
    project = Project.objects.get(pk=project_id)
    business = project.business
    context['business'] = business
    context['user'] = request.user

    rendered = render(request, template, context)

    response = HttpResponse(content_type='text/plain')
    response['Content-Disposition'] = 'attachment; filename=%s.org' % business.name
    response.write(rendered.content)
    return response
