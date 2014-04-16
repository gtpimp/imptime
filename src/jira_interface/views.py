
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib import messages
from django.template import RequestContext
from timepiece import models as timepiece
from django.http import HttpResponse, HttpResponseRedirect
from django.http import  Http404, HttpResponseForbidden
from models import Jira
from forms import JiraSettingsForm
from django.shortcuts import render_to_response, get_object_or_404, redirect, render
from jira_sync import JiraSync
import logging
logger = logging.getLogger(__name__)

@permission_required('timepiece.add_business')
def edit_settings(request, business_id, template="jira/edit_settings.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)

    if business.jira.count()==0:
        settings = Jira.objects.create(business=business, username=' ', password=' ', host=' ', board_id=' ')
    else:
        settings = business.jira.get_query_set().all()[0]

    form = JiraSettingsForm(request.user, request.POST or None, instance=settings)
    if form.is_valid():
        form.save()

    context['settings'] = settings
    context['form'] = form
    context['business'] = business

    return render_to_response(template, context, context_instance=RequestContext(request))

@login_required
def sync_business_from_jira(request, business_id, context=None):
    context = context or {}
    try:
        JiraSync(request, business_id).sync_from_jira()
        return HttpResponse("synched")
    except Exception, ex:
        logger.exception(ex)
        return HttpResponse("Sync failed: %s" % ex)

@login_required
def sync_business_to_jira(request, business_id):
    try:
        jira = JiraSync(request, business_id)
        if request.POST:
            form = jira.get_create_issue_form(request.POST)
            if form.is_valid():
                project_key = form.cleaned_data['project']
                assigned_to = form.cleaned_data['assigned_to']
                issue_type_name = form.cleaned_data['issue_type']
                try:
                    jira.sync_to_jira(project_key, assigned_to, issue_type_name)
                    return HttpResponse("synched")
                except Exception, ex:
                    return HttpResponse("Sync failed: %s" % ex)
            else:
                logger.debug("Form errors: %s" % form.errors)
                messages.info(request, "Form errors: %s" % form.errors)
        else:
            form = jira.get_create_issue_form()
        return render(request, 'jira/sync_to_jira.html', {'form': form, 'business': jira.timepiece_business})
    except Exception, ex:
        logger.exception(ex)
        return HttpResponse("Sync failed: %s" % ex)

@login_required
def sync_project_from_jira(request, project_id, context=None):
    context = context or {}
    project = timepiece.Project.objects.get(pk=project_id)
    try:
        jira_sync = JiraSync(request, project.business.id)
        jira_sync.sync_sprint_from_jira(timepiece_sprint=project)
        return HttpResponse("synched")
    except Exception, ex:
        logger.exception(ex)
        messages.error(request, "Sync of %s from jira failed : " % (project, ex))
        return HttpResponse("Sync failed: %s" % ex)

@login_required
def sync_issue_from_jira(request, issue_id, context=None):
    context = context or {}
    issue = timepiece.Issue.objects.get(pk=issue_id)
    try:
        jira_sync = JiraSync(request, issue.project.business.id)
        jira_sync.sync_issue_from_jira(timepiece_issue=issue)
        return HttpResponse("synched")
    except Exception, ex:
        logger.exception(ex)
        messages.error(request, "Sync of issue %s from jira failed : %s" % (issue, ex))
        return HttpResponse("Sync failed: %s" % ex)
