
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
        return "Cleared parameters"

    def confirm(self):

        active_command = self.cp.active_command
        if not active_command:
            return "No active command"

        if not self.cp.ready_to_execute:
            return "Waiting for more parameters for command %s" % active_command.name
        
        cmd = active_command.name

        p_values = []
        for p in self.cp.parameter_context.values():
            if p['required_by_active_command']:
                p_values.append(" with %s as %s " % ( p['name'], p['human_readable_value'] ) )
        cmd += " and ".join(p_values)

        return cmd

    
        
