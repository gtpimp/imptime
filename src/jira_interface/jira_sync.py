from jira.client import JIRA, GreenHopper
import timepiece.models as timepiece
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models import Q
from dateutil import parser as dateparser
import logging
logger = logging.getLogger(__name__)

class JiraSync(object):

    def __init__(self, timepiece_business_id):
        self.timepiece_business = timepiece.Business.objects.get(pk=timepiece_business_id)

    def sync(self):
        
        if self.timepiece_business.sync_with != "jira":
            logger.debug("Business %s is not configured to sync with jira" % self.timepiece_business.name)
            return

        try:
            self.settings = self.timepiece_business.jira.get_query_set().all()[0]
        except IndexError:
            raise Exception("No jira configuration for this business")

        #server = "https://clevva.atlassian.net"
        options = { 'server': self.settings.host.strip() }

        self.jira = JIRA(options, basic_auth=(self.settings.username.strip(), self.settings.password.strip()))

        # greenhopper is the agile plugin running on jira which knows about sprints
        self.gh = GreenHopper(options, basic_auth=(self.settings.username.strip(), self.settings.password.strip()))
        jira_sprints = self.gh.sprints(self.settings.board_id.strip())
        for jira_sprint in jira_sprints:
            self._sync_sprint(jira_sprint)

    def _sync_sprint(self, jira_sprint):
        logger.debug("syncing sprint %s" % jira_sprint.name)

        timepiece_project_name = timepiece.Project.get_code_from_name(jira_sprint.name)
        try:
            timepiece_project = timepiece.Project.objects.get(business=self.timepiece_business, name=timepiece_project_name)
        except timepiece.Project.DoesNotExist:
            timepiece_project = timepiece.Project.get_or_create_project(business=self.timepiece_business, project_name=timepiece_project_name,
                                                                        description=" (from jira)")
        
        for jira_issue in self.gh.completed_issues(self.settings.board_id.strip(), jira_sprint.id):
            self._sync_issue(jira_sprint, jira_issue, timepiece_project, suggested_state="devdone")
        for jira_issue in self.gh.incompleted_issues(self.settings.board_id.strip(), jira_sprint.id):
            self._sync_issue(jira_sprint, jira_issue, timepiece_project, suggested_state="new")

    def _sync_issue(self, jira_sprint, jira_issue, timepiece_project, suggested_state="devdone"):
        logger.debug("syncing sprint %s" % jira_sprint.name)
        state = suggested_state

        jira_issue = self.jira.issue(jira_issue.key)
        
        try:
            timepiece_issue = timepiece_project.issues.get_query_set().filter(subject__icontains=jira_issue.key+" ")[0]

            if timepiece_issue.status != state:
                timepiece_issue.status = state
                timepiece_issue.save()
                
            if timepiece_issue.number != jira_issue.id:
                timepiece_issue.number = jira_issue.id
                timepiece_issue.save()

        except IndexError:
            timepiece_issue = timepiece.Issue(project=timepiece_project,
                                              subject="%s %s" % (jira_issue.key, jira_issue.fields.summary),
                                              status=state,
                                              number=jira_issue.id)

        if hasattr(jira_issue, 'assignee') and jira_issue.assignee:
            timepiece_assigned_user = self._get_or_create_timepiece_equivalent_of_jira_user(jira_issue.assignee)
            if timepiece_issue.assigned_to != timepiece_assigned_user:
                timepiece_issue.assigned_to = timepiece_assigned_user
                timepiece_issue.save()

        if hasattr(jira_issue.fields, 'comment') and jira_issue.fields.comment.comments:
            if not timepiece_issue.id:
                timepiece_issue.save()

            for jira_comment in jira_issue.fields.comment.comments:
                try:
                    timepiece.IssueComment.objects.get(issue=timepiece_issue, comment__icontains=jira_comment.body)
                except timepiece.IssueComment.DoesNotExist:
                    author = self._get_or_create_timepiece_equivalent_of_jira_user(jira_comment.author)
                    created = dateparser.parse(jira_comment.created)
                    timepiece.IssueComment.objects.create(issue_id=timepiece_issue.id, comment=jira_comment.body, 
                                                          author=author,
                                                          created=created)
                    
                                                             
    def _get_or_create_timepiece_equivalent_of_jira_user(self, jira_username):
        try:
            return User.objects.get(Q(profile__jira_user_name=jira_username)|Q(username=jira_username))
        except User.DoesNotExist:
            logger.warning("Auto creating a limited-privileges user who is assigned to a jira issue")
            user = User.objects.create(username=jira_username)
            timepiece.UserProfile.objects.create(user=user, jira_user_name=jira_username)
            return user



    