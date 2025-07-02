from invoicing import models
from django.db.models import Sum, Count, Q, F, Max, Min
from phantom_pdf.generator import create_url_from_query_dict, render_url_to_pdf
from timepiece import models as timepiece
from django.core.files.base import ContentFile
from django.contrib.auth import login as django_login, load_backend
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth.decorators import login_required, permission_required
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse, resolve
from django.template import RequestContext
from django.contrib import messages
from forms import NouiCommandForm, RunCommandForm, command_parameter_formset, NouiCommandImportForm
from .models import NouiCommand, NouiCommandParameter, PostedAction
from django.views.decorators.csrf import csrf_exempt
from noui.command_parser import CommandParser
import logging
import json
logger = logging.getLogger(__name__)

@login_required
@permission_required('noui.command_list')
def command_list(request, template="noui/command_list.html", context=None):
    context = context or {}
    context['commands'] = NouiCommand.objects.all().order_by("name")
    context['import_form'] = NouiCommandImportForm(prefix="import")
    return render(request, template, context)

@login_required
@permission_required('noui.command_edit')
def command_add(request, template="noui/command_add.html", context=None):
    context = context or {}
    form = NouiCommandForm(request.POST or None)
    parameters_formset = command_parameter_formset(request.POST or None, queryset = NouiCommandParameter.objects.none(), prefix='parameters')
    if form.is_valid() and parameters_formset.is_valid():
        command = form.save()
        parameters = parameters_formset.save(commit=False)
        for parameter in parameters:
            parameter.command = command
            parameter.save()
        parameters_formset.save_m2m()
        messages.info(request, "New command created")
        return redirect(reverse("noui:command_edit", kwargs={'command_ref':command.id}))
    context['form'] = form
    context['parameters_formset'] = parameters_formset
    context['command_parser'] = CommandParser(request)
    return render(request, template, context)

@login_required
@permission_required('noui.command_edit')
def command_edit(request, command_ref, template="noui/command_edit.html", context=None):
    context = context or {}
    command = NouiCommand.objects.get(pk=command_ref)
    form = NouiCommandForm(request.POST or None, instance=command)
    parameters_formset = command_parameter_formset(request.POST or None, queryset = command.parameters.order_by("id"), prefix='parameters')
    if form.is_valid() and parameters_formset.is_valid():
        form.save()
        parameters = parameters_formset.save(commit=False)
        for parameter in parameters:
            parameter.command = command
            parameter.save()
        for parameter in parameters_formset.deleted_objects:
            parameter.deleted=True
            parameter.save()
        parameters_formset.save_m2m()
        messages.info(request, "Command updated")
        return redirect(reverse("noui:command_edit", kwargs={'command_ref':command.id}))
    context['form'] = form
    context['parameters_formset'] = parameters_formset
    context['command'] = command
    context['command_parser'] = CommandParser(request)
    return render(request, template, context)

@login_required
@permission_required('noui.command_edit')
def command_delete(request, command_ref, context=None):
    context = context or {}
    command = NouiCommand.objects.get(pk=command_ref)
    command.deleted = True
    command.save()
    messages.info(request, "Command %s deleted" % command.name)
    return redirect("noui:command_list")

#login_required
@csrf_exempt
def run_command(request, template="noui/command.html", context=None):
    context = context or {}

    try:
        form = RunCommandForm(request.POST or None)
        cp = CommandParser(request)
        if form.is_valid():
            raw_command = form.cleaned_data['command'].strip().lower()
            res = cp.parse_command_snippet(raw_command)
            context['last_result_message'] = res.get('last_result_message', None)

            if len(res['matching_commands']) > 1:
                context['ambiguous_commands'] = res['matching_commands']
                context['result'] = { 'status': 'ambiguous' }
                
            elif len(res['matching_commands']) == 0:
                context['result'] = { 'status': 'no_match' }

            if cp.ready_to_execute and raw_command == "go":
                try:
                    res = cp.execute_active_command()
                    context['result'] = { 'status': 'executed',
                                          'result': res }
                    context['last_result_message'] = "Executed"
                except Exception as ex:
                    logger.exception(ex)
                    context['result'] = { 'status': 'failed to execute',
                                          'exception': ex }
                    context['last_result_message'] = "Failed"
            context['command'] = form.cleaned_data['command']

            form = RunCommandForm()
                
        else:
            context['result'] = form.errors
        
        context['prompt'] = cp.get_prompt_for_next_requirement()
        context['parameters'] = cp.parameter_context
        context['form'] = form
        context['cp'] = cp
        
    except Exception as ex:
        logger.exception(ex)
        context['result'] = { 'status': 'error',
                              'exception': ex }

    
    if request.GET.get('format') == 'json':
        context['active_command'] = cp.active_command
        context['errors'] = form._errors
        del(context['form'])
        del(context['cp'])
        return HttpResponse(json.dumps(context), content_type='application/json')
    else:
        return render(request, template, context)

@login_required
@csrf_exempt
def command_context_reset(request):
    CommandParser(request).reset()
    return run_command(request)

@login_required
@permission_required('noui.command_edit')
def command_export(request, command_ref, context=None):
    context = context or {}

    try:
        command = NouiCommand.objects.get(pk=command_ref)
        data = json.dumps(command.model_to_dict(include_parameters=True))
        response = HttpResponse(data, content_type="text/json")
        response['Content-Disposition'] = 'attachment; filename=%s.json' % command.name
        return response
    except Exception as ex:
        logger.exception(ex)
        raise

@login_required
@permission_required('noui.command_edit')    
def command_import(request, context=None):
    context = context or {}    

    try:
        import_form = NouiCommandImportForm(request.POST or None, request.FILES or None, prefix="import")
        if import_form.is_valid():
            command = import_form.save()
            messages.info(request, "Command imports : %s" % command.name)
            return redirect("noui:command_list")
        
    except Exception as ex:
        logger.exception(ex)
        raise

def next_action(request, context=None):
    context = context or {}
    if not request.user.id:
        context['action'] = None
        context['status'] = 'ok'
    else:
        try:
            next_action = PostedAction.objects.all().filter(target_user=request.user, status='waiting').order_by("id").first()
            #next_action = PostedAction.objects.all().filter(target_user=request.user).order_by("id").first()
            if next_action:
                context['action'] = next_action.model_to_dict(convert_json_fields_to_json=True)
            context['status'] = 'ok'
        except Exception as ex:
            logger.exception(ex)
            context['status'] = 'failed'
            context['error_msg'] = str(ex)
    return HttpResponse(json.dumps(context), content_type='application/json')

@login_required
@csrf_exempt
def update_action_status(request, action_ref, context=None):
    context = context or {}
    new_status = request.POST['new_status']
    try:
        action = PostedAction.objects.get(pk=action_ref, target_user=request.user)
        action.status = new_status
        action.save()
        context['status'] = 'ok'
    except Exception as ex:
        logger.exception(ex)
        context['status'] = 'failed'
        context['error_msg'] = str(ex)

    return HttpResponse(json.dumps(context), content_type='application/json')
