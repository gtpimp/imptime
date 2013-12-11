
from django.contrib.auth.decorators import login_required, permission_required
from django.template import RequestContext
from timepiece import models as timepiece
from django.http import HttpResponse, HttpResponseRedirect
from django.http import  Http404, HttpResponseForbidden
from models import Jira
from forms import JiraSettingsForm
from django.shortcuts import render_to_response, get_object_or_404, redirect, render

@permission_required('timepiece.add_business')
def edit_settings(request, business_id, template="jira/edit_settings.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)
    
    if business.jira.get_query_set().count()==0:
        settings = Jira.objects.create(business=business, username=' ', password=' ', host=' ', board_id=' ')
    else:
        settings = business.jira.get_query_set().all()[0]

    form = JiraSettingsForm(request.POST or None, instance=settings)
    if form.is_valid():
        form.save()

    context['settings'] = settings
    context['form'] = form
    context['business'] = business

    return render_to_response(template, context, context_instance=RequestContext(request))
