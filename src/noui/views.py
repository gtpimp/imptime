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
from forms import NouiCommandForm, RunCommandForm, command_parameter_formset
from models import NouiCommand, NouiCommandParameter
from django.views.decorators.csrf import csrf_exempt
from noui.command_parser import CommandParser

@login_required
def command_list(request, template="noui/command_list.html", context=None):
    context = context or {}
    context['commands'] = NouiCommand.objects.all().order_by("name")
    return render_to_response(template, context, context_instance=RequestContext(request))

@login_required
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
    return render_to_response(template, context, context_instance=RequestContext(request))

@login_required
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
    return render_to_response(template, context, context_instance=RequestContext(request))

@login_required
def command_delete(request, command_ref, context=None):
    context = context or {}
    command = NouiCommand.objects.get(pk=command_ref)
    command.deleted = True
    command.save()
    messages.info(request, "Command %s deleted" % command.name)
    return redirect("noui:command_list")

@login_required
@csrf_exempt
def run_command(request, template="noui/command.html", context=None):
    context = context or {}

    form = RunCommandForm(request.POST or None)
    if form.is_valid():
        cp = CommandParser()
        raw_command = form.cleaned_data['command'].strip().lower()
        cp.parse(raw_command)
        
        command_context = {
            'verb': cp.verb,
            'subject': cp.subject,
            'parse_tree': cp.words,
            'full_text': form.cleaned_data['command']
        }

        if raw_command == "list":
            return redirect("noui:command_list")
            
        # command = Command()
        # command.init()
        # context['values'] = command.evaluate_command(request, command_context)

        context['result'] = 'Verb %s . Subject %s.' % (cp.verb, cp.subject)
        context['parse_tree'] = cp.words
    else:
        context['result'] = form.errors

    context['command'] = form.cleaned_data['command']
    context['form'] = form
    
    return render_to_response(template, context, context_instance=RequestContext(request))
