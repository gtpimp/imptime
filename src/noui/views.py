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
from noui.command_parser import CommandParser
from django.forms import ValidationError

try:
    from django.conf.urls import patterns, include, url
except ImportError:
    from django.conf.urls.defaults import patterns, include, url

class CommandNotFoundException(Exception):
    pass

class Command(object):
    accepts = []

    def init(self):
        subclasses = [cls for cls in Command.__subclasses__()]
        self.commands = dict((cls.verb, cls()) for cls in subclasses)
        self.current_context = {}
    
    def evaluate_command(self, request, command_context):
        verb = command_context['verb']
        print verb
        if verb not in self.commands:
            raise CommandNotFoundException('No command found for %s' % command_context['full_text'])

        command = self.commands[verb]
        return command.validate(request.session.get('command_context', {}), command_context)

    def get_object_for_argument(self, name, pk):
        model_names = {
            'project': models.Business,
            'issue': models.Issue,
            'sprint': models.Project
        }

        return model_names[name].objects.get(pk=pk)

    @classmethod
    def as_view(cls, request, *args, **kwargs):
        command = cls()
        current_context = request.session.get('command_context', {})
        values, is_valid = command.validate_command(current_context, **kwargs)
        
        if is_valid:
            request.session['command_context'] = current_context
            return command.django_view(request, **values)
        else:
            return HttpResponse('Please check errors: %s' % unicode(values))

    def get_project(self, project):
        try:
            project_id = int(project)
            project = timepiece.Business.objects.filter(pk=project_id).first()
        except ValueError:
            project =  timepiece.Business.objects.filter(name__iexact=project).first()
            
        if project is None:
            project = self.current_context.get('project')

        if project is None:
            raise ValidationError('Project name or id is required')
        return project

    def validate_command(self, current_context, **kwargs):
        values = {}
        self.current_context = current_context

        is_valid = True
        for key, value in kwargs.iteritems():
            if key not in self.accepts:
                continue
            func = getattr(self, 'get_' + key, None)

            if func is not None:
                try:
                    values[key] = func(value)
                except ValidationError, e:
                    values[key] = e
                    is_valid = False
            else:
                values[key] = value

        return values, is_valid

    def url_conf(self):
        urlpatterns = []
        for command in self.commands.values():
            urlpatterns.append(url(command.url_pattern(), command.as_view))

        return patterns('', *urlpatterns)

    @classmethod
    def url_pattern(cls):
        urls = []
        base_url = cls.verb  + '%s/$'
        urls = [base_url % '']
        for arg, i in enumarate(self.accepts, 1):
            urls.append(base_url + '/'.join('(?P<%s>[\d\w]+?|)' * i))
        url = r'/'.join( % arg for arg in cls.accepts)
        return r'%s/%s/$' % (cls.verb, url)
    
        
class CommandOpen(Command):
    accepts = ['project']
    verb = 'open'

    def django_view(self, request, project):
        return redirect(reverse('business_issues', kwargs={'pk': project.pk}))


class CommandEmail(Command):
    accepts = ['project', 'recipient_email']
    verb = 'email'

    def django_view(self, request, project, recipient_email):
        return HttpResponse('Email sent to %s for project %s' % (recipient_email, project))



@login_required
@csrf_exempt
def command(request, template="noui/command.html", context=None):
    context = context or {}

    form = CommandForm(request.POST or None)
    if form.is_valid():
        cp = CommandParser()
        cp.parse(form.cleaned_data['command'])
        
        command_context = {
            'verb': cp.verb,
            'subject': cp.subject,
            'parse_tree': cp.words,
            'full_text': form.cleaned_data['command']
        }

        command = Command()
        command.init()
        context['values'] = command.evaluate_command(request, command_context)

        context['result'] = 'Verb %s . Subject %s.' % (cp.verb, cp.subject)
        context['parse_tree'] = cp.words
    else:
        context['result'] = form.errors

    context['command'] = form.cleaned_data['command']
    context['form'] = form

    
    return render_to_response(template, context, context_instance=RequestContext(request))

def command_open(request, command):
    return HttpResponse('')


AVAILABLE_COMMANDS = {
    'open': command_open
}


