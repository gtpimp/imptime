from jira_interface.jira_python.jira.client import JIRA, GreenHopper
import timepiece.models as timepiece
from django.contrib.auth.models import User
from django.db.models import Q
from forms import JiraCreateIssueForm
from dateutil import parser as dateparser
import logging
logger = logging.getLogger(__name__)

class JiraSync(object):

    def __init__(self, timepiece_business_id):
        self.timepiece_business = timepiece.Business.objects.get(pk=timepiece_business_id)
        self.jira = None
        self.gh = None

    def _connect(self):

        if self.jira is not None:
            return True
        
        if self.timepiece_business.sync_with != "jira":
            logger.debug("Business %s is not configured to sync with jira" % self.timepiece_business.name)
            return False

        try:
            self.settings = self.timepiece_business.jira.get_query_set().all()[0]
        except IndexError:
            raise Exception("No jira configuration for this business")
        kwargs = {'options':{ 'server': self.settings.host.strip() },
                  'basic_auth':(self.settings.username.strip(), self.settings.password.strip())}
        self.jira = JIRA(**kwargs)
        self.gh = GreenHopper(**kwargs)
        return True

    def sync_project_issues_to_jira(self, project, jira_project_key, jira_assignee, issue_type_name):
        if not self._connect():
            return

        timepiece_issues = timepiece.Issue.objects.filter(project=project,interface_plugin_number__isnull=True)
        jira_assignee = self.settings.primary_user.profile.jira_user_name
        jira_issues = []
        for timepiece_issue in timepiece_issues:
            jira_issue = self.jira.create_issue(project={'key': jira_project_key}, summary='test: ' + timepiece_issue.subject,
                                            description=timepiece_issue.description, issuetype={'name': issue_type_name}, 
                                            assignee={'name':jira_assignee})
            timepiece_issue.interface_plugin_number = jira_issue.key
            timepiece_issue.subject="%s %s" % (jira_issue.key, jira_issue.fields.summary)
            timepiece_issue.save()
            logger.debug("Created jira_issue with key: %s" % jira_issue.key)
            jira_issues.append(jira_issue)
            
        if jira_issues:
            self.gh.add_issues_to_sprint(project.jira_inferface_number, [z.key for z in jira_issues])

    def sync_to_jira(self, project_key, jira_assignee, issue_type_name):
        if not self._connect():
            return
        business = self.timepiece_business
        projects = timepiece.Project.objects.filter(business=business)
        for project in projects:
            if project.interface_plugin_number is None:
                jira_project = self.gh.create_sprint(project.name, self.settings.board_id.strip())
                project.interface_plugin_number = jira_project.id
                project.save();
            self.sync_project_issues_to_jira(project, project_key, jira_assignee, issue_type_name)

    def sync_from_jira(self):
        if not self._connect():
            return
        jira_sprints = self.gh.sprints(self.settings.board_id.strip())
        for jira_sprint in jira_sprints:
            self._sync_sprint(jira_sprint)

    def _sync_sprint(self, jira_sprint):
        logger.debug("syncing sprint %s" % jira_sprint.name)

        try:
            timepiece_project = timepiece.Project.objects.get(business=self.timepiece_business, interface_plugin_number=jira_sprint.id)
        except timepiece.Project.DoesNotExist:
            timepiece_project_name = timepiece.Project.get_code_from_name(jira_sprint.name) + "jira"
            try:
                timepiece_project = timepiece.Project.objects.get(business=self.timepiece_business, name=timepiece_project_name)
            except timepiece.Project.DoesNotExist:
                timepiece_project = timepiece.Project.get_or_create_project(business=self.timepiece_business, project_name=timepiece_project_name,
                                                                            description=" (from jira)",
                                                                            short_description=" (from jira)")
            if timepiece_project.interface_plugin_number != jira_sprint.id:
                timepiece_project.interface_plugin_number = jira_sprint.id
                timepiece_project.save()
        except timepiece.Project.MultipleObjectsReturned:
            logger.error("Multiple projects with interface plugin number %s in %s" % jira_sprint.id, self.timepiece_business)

        order = 1
        issues_synced = []
        for gh_issue in self.gh.completed_issues(self.settings.board_id.strip(), jira_sprint.id):
            issues_synced.append(self._sync_issue(jira_sprint, gh_issue, timepiece_project, order=order))
            order += 1
        for gh_issue in self.gh.incompleted_issues(self.settings.board_id.strip(), jira_sprint.id):
            issues_synced.append(self._sync_issue(jira_sprint, gh_issue, timepiece_project, order=order))
            order += 1

        # For any issue not in the jira sprint anymore, we reset the
        # plugin number, but we don't delete the issue because we want
        # traceability.
        timepiece_project.issues.exclude(pk__in=[i.id for i in issues_synced]).update(interface_plugin_number=None)

    def _sync_issue(self, jira_sprint, gh_issue, timepiece_project, order):
        logger.debug("syncing sprint %s" % jira_sprint.name)
        jira_issue = self.jira.issue(gh_issue.key)
        state = gh_issue.statusName
        
        order = getattr(jira_issue.fields, self.settings.custom_field_name_for_issue_order)

        fixed_subject="%s %s" % (jira_issue.key, jira_issue.fields.summary)

        try:
            timepiece_issue = timepiece_project.issues.get_query_set().get(interface_plugin_number=jira_issue.key)
        except timepiece.Issue.DoesNotExist:
            timepiece_issue = timepiece.Issue(project=timepiece_project,
                                              subject=fixed_subject,
                                              description=jira_issue.fields.description or "",
                                              status=state,
                                              order=order,
                                              number=jira_issue.id,
                                              interface_plugin_number=jira_issue.key)
            timepiece_issue.number = timepiece.Issue.get_last_issue_number(timepiece_project.business)+1
        except timepiece.Issue.MultipleObjectsReturned:
            timepiece_issue = timepiece_project.issues.get_query_set().filter(interface_plugin_number=jira_issue.key)[0]

        if timepiece_issue.status != state:
            timepiece_issue.status = state

        if timepiece_issue.order != order:
            timepiece_issue.order = order

        if timepiece_issue.interface_plugin_number != jira_issue.key:
            timepiece_issue.interface_plugin_number = jira_issue.key

        if timepiece_issue.subject != fixed_subject:
            timepiece_issue.subject = fixed_subject

        if timepiece_issue.description != jira_issue.fields.description:
            timepiece_issue.description = jira_issue.fields.description or ""


        if hasattr(gh_issue, 'assignee') and gh_issue.assignee:
            timepiece_assigned_user = self._get_or_create_timepiece_equivalent_of_jira_user(gh_issue.assignee)
            if timepiece_issue.assigned_to != timepiece_assigned_user:
                timepiece_issue.assigned_to = timepiece_assigned_user

        if timepiece_issue.story_points != jira_issue.fields.timeestimate:
            timepiece_issue.story_points = jira_issue.fields.timeestimate
            
        timepiece_issue.save()

        if hasattr(jira_issue.fields, 'comment') and jira_issue.fields.comment.comments:
            for jira_comment in jira_issue.fields.comment.comments:
                try:
                    timepiece.IssueComment.objects.get(issue=timepiece_issue, comment__icontains=jira_comment.body)
                except timepiece.IssueComment.DoesNotExist:
                    author = self._get_or_create_timepiece_equivalent_of_jira_user(jira_comment.author)
                    created = dateparser.parse(jira_comment.created)
                    timepiece.IssueComment.objects.create(issue_id=timepiece_issue.id, comment=jira_comment.body, 
                                                          author=author,
                                                          created=created)
                except timepiece.IssueComment.MultipleObjectsReturned:
                    pass
        return timepiece_issue
                    
                                                             
    def _get_or_create_timepiece_equivalent_of_jira_user(self, jira_username):
        try:
            return User.objects.get(Q(profile__jira_user_name=jira_username)|Q(username=jira_username))
        except User.DoesNotExist:
            logger.warning("Auto creating a limited-privileges user who is assigned to a jira issue")
            user = User.objects.create(username=jira_username)
            timepiece.UserProfile.objects.create(user=user, jira_user_name=jira_username)
            return user

    def add_issue_comment(self, timepiece_comment):
        if not self._connect():
            return
        jira_issue = self._get_jira_issue(timepiece_comment.issue)
        self.jira.add_comment(jira_issue, timepiece_comment.comment)

    def update_issue_subject(self, timepiece_issue):
        if not self._connect():
            return
        jira_issue = self._get_jira_issue(timepiece_issue)

        # remove the initial tag from the issue name
        subject = " ".join(timepiece_issue.subject.split(" ")[1:])

        jira_issue.update(summary=subject)

    def update_issue_description(self, timepiece_issue):
        if not self._connect():
            return
        jira_issue = self._get_jira_issue(timepiece_issue)
        jira_issue.update(description=timepiece_issue.description)

    def update_issue_status(self, timepiece_issue):
        if not self._connect():
            return
        jira_issue = self._get_jira_issue(timepiece_issue)
        transitions = self.jira.transitions(jira_issue)

        transition = [ t for t in transitions if t['id'] == timepiece_issue.status ][0]
        self.jira.transition_issue(jira_issue, transitionId=transition['id'])

        timepiece_issue.status = transition['name']
        timepiece_issue.save()

    def update_issue_points(self, issue_points):
        if not self._connect():
            return
        primary_user = self.settings.primary_user
        if not primary_user or issue_points.user.pk != primary_user.pk:
            return
        
        jira_issue = self._get_jira_issue(issue_points.issue)
        estimate = u'%dm' % (float(issue_points.points) * 60)
        jira_issue.update(timetracking={'originalEstimate': estimate})
        

    def update_issue_assigned_to(self, timepiece_issue, username, *args, **kwargs):
        if not self._connect():
            return
        if timepiece_issue.interface_plugin_number is None:
            return
        jira_issue = self._get_jira_issue(timepiece_issue)
        
        if timepiece_issue.assigned_to is None:
            try:
                timepiece_issue.assigned_to = User.objects.get(profile__jira_user_name=username)
                timepiece_issue.save()
            except User.DoesNotExist:
                return

        self.jira.assign_issue(jira_issue, timepiece_issue.assigned_to.profile.jira_user_name)

    def create_issue(self, timepiece_issue, jira_create_issue_form):
        if not self._connect():
            return

        jira_project_key = jira_create_issue_form.cleaned_data['project']
        jira_issue_type_name = jira_create_issue_form.cleaned_data['issue_type']
        jira_assignee = jira_create_issue_form.cleaned_data['assigned_to']

        jira_issue = self.jira.create_issue(project={'key': jira_project_key}, summary=timepiece_issue.subject,
                                            description=timepiece_issue.description, issuetype={'name': jira_issue_type_name},
                                            assignee={'name':jira_assignee})
        # if timepiece_issue.project.interface_plugin_number is not None:
        #     self.gh.add_issues_to_sprint(timepiece_issue.project.interface_plugin_number, [jira_issue.key])
        timepiece_issue.interface_plugin_number = jira_issue.key
        timepiece_issue.subject="%s %s" % (jira_issue.key, jira_issue.fields.summary)
        timepiece_issue.save()
        logger.debug("Created jira_issue with key: %s" % jira_issue.key)

    def get_create_issue_form(self, post_data=None):
        if not self._connect():
            return
        jira_projects = self.gh.projects()
        jira_issue_types = self.gh.issue_types()
        jira_users = self.gh.search_assignable_users_for_projects("", [x.key for x in jira_projects])
        return JiraCreateIssueForm(jira_projects, jira_issue_types, jira_users, post_data, prefix='jira_form')
        
    def get_allowed_stati(self, timepiece_issue, *args, **kwargs):
        if not self._connect():
            return
        jira_issue = self._get_jira_issue(timepiece_issue)
        transitions=self.jira.transitions(jira_issue)
        return tuple( [ (t['id'], t['name']) for t in transitions ] )

    def get_assignable_users(self, timepiece_issue, *args, **kwargs):
        if not self._connect():
            return None
        if timepiece_issue.interface_plugin_number is None:
            return None
        jira_users = self.gh.search_assignable_users_for_issues("", issueKey = timepiece_issue.interface_plugin_number)
        return [ (x.name, x.name) for x in jira_users ]

    def issue_moved_projects(self, timepiece_issue, old_timepiece_project, new_timepiece_project, *args, **kwargs):
        """ Moving an non-jira-issue into a jira project means we will
        create the issue in jira. Partial broken implementation
        commented out because we also need to ask the user what jira
        project to use (which isn't the same as a jira sprint)"""

        return None
        # if not self._connect():
        #     return None
        # if timepiece_issue.interface_plugin_number is None and new_timepiece_project.interface_plugin_number is not None:
        #     
        #     jira_issue_type_name = self.gh.issue_types()[0].name # pick a default issue type

        #     new_jira_project = self._get_jira_project(new_timepiece_project)
        #     jira_issue = self.jira.create_issue(project={'key': new_jira_project.key}, 
        #                                         summary=timepiece_issue.subject,
        #                                         description=timepiece_issue.description, issuetype={'name': jira_issue_type_name})
        #     timepiece_issue.interface_plugin_number = jira_issue.key
        #     timepiece_issue.subject="%s %s" % (jira_issue.key, jira_issue.fields.summary)
        #     timepiece_issue.save()
        #     logger.debug("By moving the issue, we created a jira_issue with key: %s" % jira_issue.key)

    def _get_jira_issue(self, timepiece_issue):
        return self.jira.issue(timepiece_issue.interface_plugin_number)

    def _get_jira_project(self, timepiece_project):
        matching_sprints = [x for x in self.gh.sprints(self.settings.board_id.strip()) if x.id==int(timepiece_project.interface_plugin_number)]
        return matching_sprints[0]
