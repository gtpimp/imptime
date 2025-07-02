from noui.models import NouiCommand
from django.urls import reverse, resolve

class BuiltInCommands(object):
    """ This class is for simple built-in commands, just to isolate them from the overall command parsing logic """

    def __init__(self, command_parser):
        self.cp = command_parser
    
    def try_process_command(self, command):
        command = command.strip()
        if hasattr(self, command):
            func = getattr(self, command)
            return func()
        else:
            return None

    def clear(self):
        self.cp.reset()
        return { 'msg': "Cleared parameters" }

    def confirm(self):
        return { 'msg' : self.cp.command_as_human_readable_string() }

    def help(self):
        res = [ "%s - %s"%(x.name, x.pattern) for x in NouiCommand.objects.all().order_by("name") ]
        if len(res) == 0:
            return { 'msg' : "No commands created yet" }
        return { 'msg' : "<br/>".join(res) }

