import nltk
import logging
import importlib
import re
logger=logging.getLogger(__name__)
from models import NouiCommand

class CommandParser(object):

    def __init__(self, request):
        super(CommandParser, self).__init__()
        self.request = request
        self.result = {}
        self._active_command = None

    @property
    def active_command(self):
        if self._active_command:
            return self._active_command
        active_command_id = self.command_context.get("active_command_id", None)
        if not active_command_id:
            return active_command_id
        self._active_commmand = NouiCommand.objects.get(pk=active_command_id)
        return self._active_commmand

    def reset(self):
        if self.request.session.get('noui_command_context'):
            del self.request.session['noui_command_context']
    
    @property
    def command_context(self):
        return self.request.session.setdefault('noui_command_context', {})

    def _update_parameter_context(self, parameter_context):
        self.request.session['parameters'] = parameter_context
    
    @property
    def parameter_context(self):
        return self.command_context.setdefault('parameters', {})

    @property
    def ready_to_execute(self):
        return self.active_command and self.are_all_required_parameters_populated
    
    @property
    def are_all_required_parameters_populated(self):
        for info in self.parameter_context.values():
            if info['required_by_active_command'] and not info['value']:
                return False
        return True

    @property
    def parameters_with_resolved_values(self):
        parameters = {}
        for info in self.parameter_context.values():
            if info['required_by_active_command']:
                parameters[info['var_name']] = unicode(info['value']).strip()
        return parameters
        
    def parse_command_snippet(self, raw_command):
        self.command_string = self._sanitize_raw_command(raw_command)

        res = NouiCommand.objects.raw("""select * from noui_nouicommand, regexp_matches('%s', pattern) where deleted='f'""" % self.command_string)
        matching_commands = [ command for command in res ]
        self.command_context['matching_commands'] = [ { 'name': x.name, 'id': x.id } for x in matching_commands ]
        if len(matching_commands) == 1:
            self._set_active_command(matching_commands[0])

        if len(matching_commands) == 0 and self.command_context.get('active_command_id', None):
            self.parse_command_parameters(self.command_string)
            
        return { 'matching_commands': matching_commands }

    def execute_active_command(self):
        command = self.active_command
        if not command:
            raise Exception("No active command")
        
        code_locals = self.parameters_with_resolved_values
        try:
            res = self._call_noui_code_snippet(command.command_function, code_locals)
        except Exception, ex:
            logger.exception(ex)
            raise
        return res
    
    def _set_active_command(self, noui_command):
        self._active_command = noui_command
        self.command_context['active_command_id'] = self._active_command.id if noui_command else None

        for p in self.parameter_context.values():
            p['required_by_active_command'] = False
        self.parse_command_parameters("")
    
    def parse_command_parameters(self, command_string):
        parameters = self.active_command.parameters.all().order_by("id")
        parameter_value = None
        parameter_context = self.parameter_context
        for p in parameters:
            parameter_info = parameter_context.get(p.name, { 'name': p.name,
                                                             'id': p.id,
                                                             'var_name': p.var_name,
                                                             'value': None,
                                                             'pattern': p.pattern,
                                                             'human_readable_value': None })
            parameter_info['required_by_active_command'] = True
            
            res = re.match(p.pattern, command_string)
            if res and res.groups():
                raw_parameter_value = res.groups()[0]
                parameter_value = self._resolve_parameter_value(p, raw_parameter_value)
                parameter_info['human_readable_parameter_value'] = unicode(parameter_value)
                if parameter_value and hasattr(parameter_value, "id"):
                    parameter_value = parameter_value.id
                parameter_info['value'] = parameter_value
                
            parameter_context[p.name] = parameter_info

        self._update_parameter_context(parameter_context)
                    
    def _sanitize_raw_command(self, command):
        # because the command is run inside a regexp_matches clause
        # and surrounded by quotes, simply removing all quotes from
        # the command is enough to prevent sql injection, I think?
        c = command.lower().replace("'", "").replace('"', "").strip()
        if len(c)>0:
            c += " " #trailing space to make regexes feel more natural when entering them
        return c
    
    def _resolve_parameter_value(self, command_parameter, raw_parameter_value):
        code_locals = { 'search_string': raw_parameter_value.strip() }
        code_locals['parameters'] = self.parameters_with_resolved_values
        parameter_value = self._call_noui_code_snippet(command_parameter.search_function, code_locals)
        return parameter_value

    def _call_noui_code_snippet(self, code, code_locals):

        code_globals = {}
        exec(code, code_globals, code_locals)
        res = code_locals.get('res', None)
        if 'res' not in code_locals:
            logger.info("This code snippet didn't set res: %s" % code)
            raise Exception("No res variable specified to hold the result of the code snippet")
        return res
