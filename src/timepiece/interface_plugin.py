from jira_interface.jira_sync import JiraSync
import logging
logger = logging.getLogger(__name__)

class DefaultInterfacePlugin(object):
    def add_issue_comment(self, *args, **kwargs):
        return
    def update_issue_status(self, *args, **kwargs):
        return

default_interface_plugin = DefaultInterfacePlugin

def get_interface_plugin(business):
    global default_interface_plugin
    if not business.sync_with:
        return default_interface_plugin
    
    if business.sync_with == 'jira':
        return JiraSync(business.id)

    logger.error("Unknown interface plugin name [%s] for business %s" % (business.sync_with, business))
    return default_interface_plugin
