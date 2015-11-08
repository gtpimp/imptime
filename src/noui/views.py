from invoicing import models
from django.db.models import Sum, Count, Q, F, Max, Min
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
from forms import CommandForm
from django.views.decorators.csrf import csrf_exempt

@login_required
@csrf_exempt
def command(request, template="noui/command.html", context=None):
    context = context or {}

    form = CommandForm(request.POST or None)
    if form.is_valid():
        pass
    context['command'] = form.cleaned_data['command']
    context['form'] = form

    context['result'] = 'Ok'
    
    return render_to_response(template, context, context_instance=RequestContext(request))
