from jira.client import JIRA, GreenHopper
import timepiece.models as timepiece
import logging
logger = logging.getLogger(__name__)

class JiraSync(object):

    def __init__(self, timepiece_business_id):
        self.business = timepiece.Business.objects.get(pk=timepiece_business_id)

    def sync(self):
        
        if self.business.sync_with != "jira":
            logger.debug("Business %s is not configured to sync with jira" % self.business.name)
            return

        try:
            settings = self.business.jira.get_query_set().all()[0]
        except IndexError:
            raise Exception("No jira configuration for this business")

        #server = "https://clevva.atlassian.net"
        options = { 'server': settings.host.strip() }

        # greenhopper is the agile plugin running on jira which knows about sprints
        gh=GreenHopper(options, basic_auth=(settings.username.strip(), settings.password.strip()))
        jira_sprints = gh.sprints(settings.board_id.strip())
        for jira_sprint in jira_sprints:
            self._sync_sprint(jira_sprint)

    def _sync_sprint(self, jira_sprint):
        logger.debug("syncing sprint %s" % jira_sprint.name)

# (Pdb) gh.sprints(3)
# [<JIRA Sprint: name=u'Nov-21 - Nov-29 Sprint 17', id=3>, <JIRA Sprint: name=u'Sprint 18', id=4>]
# (Pdb) x=gh.sprints(3)[1]
# (Pdb) x.issues
# --- AttributeError: 'Sprint' object has no attribute 'issues'
# (Pdb) gh.issues(sprint)
# --- AttributeError: 'GreenHopper' object has no attribute 'issues'
# (Pdb) gh.incompleted_issues(3, 4)
# [<JIRA Issue: key=u'CLVUSRPERM-3', id=10204>, <JIRA Issue: key=u'CLVUSRPERM-4', id=10220>, <JIRA Issue: key=u'CLVUSRPERM-5', id=10221>, <JIRA Issue: key=u'CLVUSRPERM-6', id=10223>, <JIRA Issue: key=u'CLVUSRPERM-7', id=10224>, <JIRA Issue: key=u'CLVUSRPERM-8', id=10226>, <JIRA Issue: key=u'CLVUSRPERM-9', id=10228>, <JIRA Issue: key=u'CLVWEBFRNT-6', id=10225>, <JIRA Issue: key=u'CLVWEBFRNT-7', id=10227>, <JIRA Issue: key=u'GAAPCLSA-1', id=10028>, <JIRA Issue: key=u'GAAPCLSA-2', id=10029>, <JIRA Issue: key=u'GAAPCLSA-3', id=10030>, <JIRA Issue: key=u'GAAPCLSA-4', id=10031>, <JIRA Issue: key=u'GAAPCLSA-5', id=10033>, <JIRA Issue: key=u'GAAPCLSA-6', id=10034>, <JIRA Issue: key=u'GAAPCLSA-7', id=10035>, <JIRA Issue: key=u'GAAPCLSA-8', id=10037>, <JIRA Issue: key=u'MAP-1', id=10000>, <JIRA Issue: key=u'MAP-2', id=10001>, <JIRA Issue: key=u'MAP-3', id=10002>, <JIRA Issue: key=u'MAP-4', id=10003>, <JIRA Issue: key=u'MAP-5', id=10004>, <JIRA Issue: key=u'MAP-8', id=10007>, <JIRA Issue: key=u'MAP-9', id=10008>, <JIRA Issue: key=u'MAP-13', id=10012>, <JIRA Issue: key=u'SBSAPOC-2', id=10020>, <JIRA Issue: key=u'SBSAPOC-4', id=10022>, <JIRA Issue: key=u'SWAWEBFRNT-1', id=10014>, <JIRA Issue: key=u'SWAWEBFRNT-2', id=10015>]
# (Pdb) 


    