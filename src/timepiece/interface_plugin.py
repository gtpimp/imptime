import logging
logger = logging.getLogger(__name__)

class DefaultInterfacePlugin(object):
    def add_issue_comment(self, timepiece_comment, *args, **kwargs):
        return
    def update_issue_status(self, timepiece_issue, *args, **kwargs):
        return
    def get_allowed_stati(self, timepiece_issue, *args, **kwargs):
        return None
    def get_create_issue_form(self, *args, **kwargs):
        return None
    def create_issue(self, timepiece_issue, issue_form):
        return None
    def get_assignable_users(self, timepiece_issue, *args, **kwargs):
        return None
    def update_issue_assigned_to(self, timepiece_issue, username, *args, **kwargs):
        return None
    def issue_moved_projects(self, timepiece_issue, old_timepiece_project, new_timepiece_project, *args, **kwargs):
        return None
    def update_issue_subject(self, timepiece_issue, *args, **kwargs):
        return None
    def update_issue_description(self, timepiece_issue, *args, **kwargs):
        return None
    def update_issue_points(self, issue_points, *args, **kwargs):
        return None

default_interface_plugin = DefaultInterfacePlugin()

def get_interface_plugin(business):
    global default_interface_plugin
    if not business.sync_with:
        return default_interface_plugin
    
    if business.sync_with == 'jira':
        from jira_interface.jira_sync import JiraSync
        return JiraSync(business.id)

    logger.error("Unknown interface plugin name [%s] for business %s" % (business.sync_with, business))
    return default_interface_plugin
