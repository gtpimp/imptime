
from django.contrib.auth.decorators import login_required, permission_required
from django.urls import reverse
from django.core.exceptions import PermissionDenied
from django.contrib import messages
from django.template import RequestContext
from timepiece import models as timepiece
from django.http import HttpResponse, HttpResponseRedirect
from django.http import  Http404, HttpResponseForbidden
from models import Jira, JiraUser
from forms import JiraSettingsForm, JiraUserForm
from django.shortcuts import get_object_or_404, redirect, render
from jira_sync import JiraSync
import logging
logger = logging.getLogger(__name__)

@permission_required('timepiece.add_business')
def edit_settings(request, business_id, template="jira/edit_settings.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)

    if business.jira.count()==0:
        settings = Jira.objects.create(business=business, host=' ', board_id=' ')
    else:
        settings = business.jira.get_query_set().all()[0]

    form = JiraSettingsForm(request.POST or None, instance=settings)
    if form.is_valid():
        form.save()

    context['settings'] = settings
    context['form'] = form
    context['business'] = business

    return render(request, template, context)

def my_settings(request, business_id, template="jira/my_settings.html", context=None):
    context = context or {}
    business = timepiece.Business.objects.get(pk=business_id)

    current_user = request.user
    bp = timepiece.BusinessPermissions.for_user(current_user, business)
    if not bp.has_view_issues:
        raise PermissionDenied

    settings = Jira.objects.get(business=business)
    jira_user = JiraUser.objects.get_or_create(jira=settings, timepiece_user=current_user,
                                               defaults={'jira_username':' ', 'jira_password':' '})[0]

    form = JiraUserForm(request.POST or None, instance=jira_user)
    if form.is_valid():
        jira_user = form.save(commit=False)
        jira_user.jira = settings
        jira_user.save()
        form.save_m2m()
        messages.info(request, "Saved settings")
        return HttpResponseRedirect(reverse('jira:my_settings', kwargs={'business_id':business.id}))

    context['form'] = form
    context['jira_settings'] = settings
    context['business'] = business
    context['user'] = current_user

    return render(request, template, context)

@login_required
def sync_business_from_jira(request, business_id, context=None):
    context = context or {}
    try:
        JiraSync(request, business_id).sync_from_jira()
        return HttpResponse("synched")
    except Exception as ex:
        logger.exception(ex)
        return HttpResponse("Sync failed: %s" % ex)

@login_required
def sync_project_to_jira(request, timepiece_project_id, template="jira/sync_to_jira.html"):
    try:
        timepiece_project = timepiece.Project.objects.get(pk=timepiece_project_id)
        jira = JiraSync(request, timepiece_project.business.id)
        if request.POST:
            form = jira.get_create_issue_form(request.POST)
            if form.is_valid():
                jira_project_key = form.cleaned_data['project']
                jira_assigned_to = form.cleaned_data['assigned_to']
                jira_issue_type_name = form.cleaned_data['issue_type']
                try:
                    jira.sync_project_to_jira(timepiece_project_id, jira_project_key, jira_assigned_to, jira_issue_type_name)
                    messages.info(request, "Synced %s to jira" % timepiece_project)
                    return HttpResponse("Synched")
                except Exception as ex:
                    logger.exception(ex)
                    messages.error(request, "Failed to sync %s to jira : %s" % (timepiece_project, ex))
                    return HttpResponse("Sync failed: %s" % ex)
            else:
                logger.debug("Form errors: %s" % form.errors)
                messages.info(request, "Form errors: %s" % form.errors)
        else:
            form = jira.get_create_issue_form()

        context = { 'form': form,
                    'project': timepiece_project }
        return render(request, template, context)

    except Exception as ex:
        logger.exception(ex)
        return HttpResponse("Sync failed: %s" % ex)

@login_required
def sync_project_from_jira(request, timepiece_project_id, context=None):
    context = context or {}
    timepiece_project = timepiece.Project.objects.get(pk=timepiece_project_id)
    try:
        jira_sync = JiraSync(request, timepiece_project.business.id)
        jira_sync.sync_sprint_from_jira(timepiece_sprint=timepiece_project)
        return HttpResponse("synched")
    except Exception as ex:
        logger.exception(ex)
        messages.error(request, "Sync of %s from jira failed : " % (timepiece_project, ex))
        return HttpResponse("Sync failed: %s" % ex)

@login_required
def sync_issue_from_jira(request, issue_id, context=None):
    context = context or {}
    issue = timepiece.Issue.objects.get(pk=issue_id)
    try:
        jira_sync = JiraSync(request, issue.project.business.id)
        jira_sync.sync_issue_from_jira(timepiece_issue=issue)
        return HttpResponse("synched")
    except Exception as ex:
        logger.exception(ex)
        messages.error(request, "Sync of issue %s from jira failed : %s" % (issue, ex))
        return HttpResponse("Sync failed: %s" % ex)
