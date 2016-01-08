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

    @property
    def command_context(self):
        return self.request.session.setdefault('noui_command_context', {})

    @property
    def parameter_context(self):
        return self.command_context.setdefault('parameters', {})

    @property
    def are_all_required_parameters_populated(self):
        for info in self.parameter_context.values():
            if info['required_by_active_command'] and not info['value']:
                return False
        return True

    @property
    def parameters_with_resolved_values(self):
        parameters = []
        for info in self.parameter_context.values():
            if info['required_by_active_command']:
                parameters[info['name']] = info['value']
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
            self._set_active_command(None)
            
        return { 'matching_commands': matching_commands }

    def execute_active_command(self):
        command = self.active_command
        if not command:
            raise Exception("No active command")
        
        func = self._resolve_noui_function(command.command_function)
        parameters = self.parameters_with_resolved_values
        res = func(**parameters)
        return res
    
    def _set_active_command(self, noui_command):
        self._active_command = noui_command
        self.command_context['active_command_id'] = self._active_command.id if noui_command else None

        for p in self.parameter_context.items():
            p['required_by_active_command'] = False
        self.parse_command_parameters("")
    
    def parse_command_parameters(self, command_string):
        parameters = self.active_command.parameters.all().order_by("id")
        parameter_value = None
        for p in parameters:
            parameter_info = self.parameter_context.setdefault(p.id, { 'name': p.name,
                                                                       'id': p.id,
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
                
            self.parameter_context[p.id] = parameter_info
                    
    def _sanitize_raw_command(self, command):
        # because the command is run inside a regexp_matches clause
        # and surrounded by quotes, simply removing all quotes from
        # the command is enough to prevent sql injection.
        c = command.lower().replace("'", "").replace('"', "").strip()
        if len(c)>0:
            c += " " #trailing space to make regexes feel more natural when entering them
        return c
    
    def _resolve_parameter_value(self, command_parameter, raw_parameter_value):
        func = self._resolve_noui_function(command_parameter.search_function)
        parameter_value = func(raw_parameter_value)
        return parameter_value

    def _resolve_noui_function(self, function_string):
        parts = function_string.split(".")
        package_name = ".".join(parts[:-2])
        module_name = parts[-2]
        func_name = parts[-1]
        module = __import__(package_name, fromlist=[module_name])
        func = getattr(module, func_name)
        return func

