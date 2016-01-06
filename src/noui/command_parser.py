import nltk
import logging
logger=logging.getLogger(__name__)

class CommandParser(object):

    def __init__(self, request):
        super(CommandParser, self).__init__()
        self.request = request
        self.result = {}
    
    def run_command(self, command):
        self.command = command

        return { 'command': self.command,
                 'status': 'ok' }

    def __unicode__(self):
        return str(self.words)
