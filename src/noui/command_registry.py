import logging
logger = logging.getLogger(__name__)

class CommandRegistry(object):
    """singleton, construct like normal to get the singleton instance"""

    _registry_by_noun = {}
                
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(CommandRegistry, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def register_command(self, noun, command):
        """ call to add a new command to the registry.

        noun : the primary noun word associated with this command
        command : a class extending from CommandInterface
        """
        self._registry_by_noun[noun] = command

    def handle_command(self, command_parser):
        """ call to process a new command """
        
        noun = command_parser.subject
        if noun is None:
            raise Exception("No noun in command: %s" % command_parser)

        command = self._registry_by_noun.get(noun, None)
        if not command:
            raise Exception("No command associated with %s. %s" % (noun, command_parser))

        command_params = command.supported(command_parser)
        if not command_params:
            raise Exception("Command object doesn't support this command: %s %s" % (noun, command_parser))

        try:
            command.action(command_parser, command_params)
        except Exception, ex:
            logger.exception(ex)
            raise Exception("Command failed: %s" % ex)

class CommandInterface(object):

    def supported(self, command_parser):
        """ this function returns None if the command can't be handled, or any object which will then be provided to action_callback if chosen """
        raise Exception("Overwrite")

    def action(self, command_parser, params):
        """ params is whatever was returned from the call to supports_callback. """
        raise Exception("Overwrite")

    