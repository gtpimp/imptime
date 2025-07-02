from noui.models import PostedAction
import json
from django.urls import reverse

class PostedActionHelper(object):

    def __init__(self, request, command_parser, *args, **kwargs):
        super(PostedActionHelper, self).__init__(*args, **kwargs)
        self.request = request
        self.command_parser = command_parser

    def redirect(self, dest_url):
        action = PostedAction.objects.create( source_command=self.command_parser.active_command,
                                                  target_user=self.command_parser.target_user,
                                                  target_device=self.command_parser.target_device,
                                                  source_user=self.request.user,
                                                  human_readable_source_command=self.command_parser.command_as_human_readable_string(),
                                                  status='waiting',
                                                  action_type='redirect',
                                                  action_args=json.dumps( {'url': reverse(dest_url)} ) )
        return action

    def javascript(self, func):
        action = PostedAction.objects.create( source_command=self.command_parser.active_command,
                                                  target_user=self.command_parser.target_user,
                                                  target_device=self.command_parser.target_device,
                                                  source_user=self.request.user,
                                                  human_readable_source_command=self.command_parser.command_as_human_readable_string(),
                                                  status='waiting',
                                                  action_type='javascript',
                                                  action_args=json.dumps( {'func': func} ) )
        return action
    
    def run(self, action):
        if action.action_type == 'redirect':
            return self._run_redirect(self, action)
        else:
            raise Exception("Unsupported action type: %s" % action.action_type)

    def _run_redirect(self, action):
        raise Exception("Huh?")
    
