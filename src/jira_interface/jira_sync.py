from jira_interface.jira_python.jira.client import JIRA, GreenHopper
import timepiece.models as timepiece
from datetime import datetime
from django.db.models import Sum, Count, Q, F, Max, Min
from jira_interface.models import JiraSyncStatus
from django.contrib.auth.models import User
from django.contrib import messages
from django.db.models import Q
from models import JiraUser, Jira
from forms import JiraCreateIssueForm
from dateutil import parser as dateparser
import logging
logger = logging.getLogger(__name__)

class JiraSync(object):

    def __init__(self, request, timepiece_business_id, user=None):
        self.request = request
        self.timepiece_business = timepiece.Business.objects.get(pk=timepiece_business_id)
        self.jira = None
        self.jira_settings = Jira.objects.get(business=self.timepiece_business)
        self.gh = None
        self.errors = []
        self.user = user or self.request.user

    def _on_error(self, err_obj):
        if isinstance(err_obj, Exception):
            logger.exception(err_obj)
        else:
            logger.error(err_obj)
        self.errors.append(str(err_obj))
        if self.request:
            messages.error(self.request, str(err_obj))

    def _connect(self):
        res = self._create_jira_connection_for_user(self.timepiece_business, self.user)
        self.settings = res['settings']
        self.active_user = res['active_user']
        self.jira = res['jira']
        self.gh = res['gh']
        return True

    @classmethod
    def _create_jira_connection_for_user(self, business, user):
        if business.sync_with != "jira":
            logger.debug("Business %s is not configured to sync with jira" % business.name)
            return False

        try:
            settings = business.jira.get_query_set().all()[0]
        except IndexError:
            raise Exception("No jira configuration for this business")
        user_settings = settings.get_user_settings(user)

        kwargs = {'options':{ 'server': settings.host.strip() },
                  'basic_auth':(user_settings.jira_username.strip(), user_settings.jira_password.strip())}
        active_user = user_settings.timepiece_user
        jira = JIRA(**kwargs)
        gh = GreenHopper(**kwargs)

        return { 'active_user': active_user,
                 'settings': settings,
                 'jira': jira,
                 'gh': gh }

    def sync_project_to_jira(self, timepiece_project_id, jira_project_key, jira_assignee, jira_issue_type_name):
        try:
            if not self._connect():
                return
            timepiece_project = timepiece.Project.objects.get(pk=timepiece_project_id)
            if timepiece_project.interface_plugin_number is None:
                messages.info(self.request, "Not a jira sprint")
                return
                # jira_project = self.gh.create_sprint(project.name, self.settings.board_id.strip())
                # project.interface_plugin_number = jira_project.id
                # project.save();
            self.sync_project_issues_to_jira(timepiece_project, jira_project_key, jira_assignee, jira_issue_type_name)
            if self.request:
                messages.info(self.request, "Sync to jira complete")
        except Exception as ex:
            self._on_error(ex)

    def sync_project_issues_to_jira(self, timepiece_project, jira_project_key, jira_assignee, issue_type_name):
        if not self._connect():
            return

        timepiece_issues = timepiece.Issue.objects.filter(project=timepiece_project,interface_plugin_number__isnull=True)
        jira_issues = []
        for timepiece_issue in timepiece_issues:
            jira_issue = self.jira.create_issue(project={'key': jira_project_key}, summary=timepiece_issue.subject,
                                            description=timepiece_issue.description, issuetype={'name': issue_type_name},
                                            assignee={'name':jira_assignee})
            timepiece_issue.interface_plugin_number = jira_issue.key
            timepiece_issue.subject="%s %s" % (jira_issue.key, jira_issue.fields.summary)
            timepiece_issue.save()
            logger.debug("Created jira_issue with key: %s" % jira_issue.key)
            jira_issues.append(jira_issue)

        if jira_issues:
            self.gh.add_issues_to_sprint(timepiece_project.interface_plugin_number, [z.key for z in jira_issues])

    def sync_from_jira(self):
        try:
            self._sync_sprint_names_from_jira()
        except Exception as ex:
            self._on_error(ex)

    def _sync_sprint_names_from_jira(self):
        """ makes sure there is a timepiece sprint for every jira sprint, but doesn't sync their issues """
        try:
            if not self._connect():
                return
            jira_sprints = self.gh.sprints(self.settings.board_id.strip())
            num_projects_synced = 0
            for jira_sprint in jira_sprints:
                self._get_or_create_timepiece_sprint_for_jira_sprint(jira_sprint)
                num_projects_synced += 1

            if self.request:
                messages.info(self.request, "Fetched %d projects from jira" % num_projects_synced)
        except Exception as ex:
            self._on_error(ex)

    def sync_issue_from_jira(self, timepiece_issue):
        try:
            if not self._connect():
                return
        except Exception as ex:
            self._on_error(ex)

        if timepiece_issue.interface_plugin_number:
            jira_issue = self.jira.issue(timepiece_issue.interface_plugin_number)
            self._sync_issue(jira_issue, timepiece_issue.project)

    def sync_sprint_from_jira(self, timepiece_sprint):
        try:
            num_synced = 0
            num_deleted = 0
            if not self._connect():
                return
            jira_sprints = self.gh.sprints(self.settings.board_id.strip())
            found = False
            for jira_sprint in jira_sprints:
                if unicode(jira_sprint.id) == timepiece_sprint.interface_plugin_number:
                    num_synced, num_deleted = self._sync_sprint_from_jira(jira_sprint, timepiece_project=timepiece_sprint)
                    found = True
                    break;

            if not found:
                if self.request:
                    messages.error(self.request, "No jira sprint found matching this project. Expected %s" % timepiece_sprint.interface_plugin_number)

            if self.request:
                messages.info(self.request, "Sync of %s from jira complete, %d issues synced, %d issues deleted" % (timepiece_sprint, num_synced, num_deleted))
        except Exception as ex:
            self._on_error(ex)

    def _get_or_create_timepiece_sprint_for_jira_sprint(self, jira_sprint):
        timepiece_project_name = timepiece.Project.get_code_from_name(jira_sprint.name)
        try:
            timepiece_project = timepiece.Project.objects.get(business=self.timepiece_business, interface_plugin_number=jira_sprint.id)
        except timepiece.Project.DoesNotExist:
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
            logger.error("Multiple projects with interface plugin number %s in %s" % (jira_sprint.id, self.timepiece_business))

        if timepiece_project.name != timepiece_project_name:
            timepiece_project.name = timepiece_project_name
            timepiece_project.save()

        return timepiece_project

    def _sync_sprint_from_jira(self, jira_sprint, timepiece_project):
        logger.debug("syncing sprint %s" % jira_sprint.name)

        num_synced = 1
        issues_synced = []
        for gh_issue in self.gh.completed_issues(self.settings.board_id.strip(), jira_sprint.id):
            issues_synced.append(self._sync_issue_from_jira(gh_issue, timepiece_project))
            num_synced += 1
        for gh_issue in self.gh.incompleted_issues(self.settings.board_id.strip(), jira_sprint.id):
            issues_synced.append(self._sync_issue_from_jira(gh_issue, timepiece_project))
            num_synced += 1

        timepiece_missing_issues = timepiece_project.issues.exclude(pk__in=[i.id for i in issues_synced])
        timepiece_missing_issues.update(interface_plugin_number=None)

        num_deleted = 0
        timepiece_missing_issues_without_time = timepiece_missing_issues.values('id').annotate(hours=Count('entries')).filter(hours__eq=0)
        for missing_issue in timepiece_missing_issues_without_time:
            timepiece_project.issues.all().filter(pk=missing_issue['id']).delete()
            num_deleted += 1

        return num_synced, num_deleted

    def _sync_issue_from_jira(self, gh_issue, timepiece_project):

        try:
            if not hasattr(gh_issue, 'fields'):
                jira_issue = self.jira.issue(str(gh_issue.id))
            else:
                jira_issue = gh_issue

            logger.debug("syncing issue")
            state = jira_issue.fields.status.name
            jira_order = getattr(jira_issue.fields, self.settings.custom_field_name_for_issue_order)
            if isinstance(jira_order, basestring):
                order2 = jira_order
                order = 1
            else:
                order2 = None
                order = int(jira_order or 0)

            fixed_subject="%s %s" % (jira_issue.key, jira_issue.fields.summary)
            logger.info("Sorting: %s = %s" % (str(jira_issue.fields.customfield_10300), fixed_subject))

            time_estimate = float(jira_issue.fields.timeestimate or 0) / (60*60) # cos everybody knows you should estimate to accuracy in seconds
            time_estimate = float(int(time_estimate*100))/100

            try:
                timepiece_issue = timepiece.Issue.objects.get(interface_plugin_number=jira_issue.key)
            except timepiece.Issue.DoesNotExist:
                timepiece_issue = timepiece.Issue(project=timepiece_project,
                                                  subject=fixed_subject,
                                                  description=jira_issue.fields.description or "",
                                                  status=state,
                                                  number=jira_issue.id,
                                                  interface_plugin_number=jira_issue.key)
                timepiece_issue.number = timepiece.Issue.get_last_issue_number(timepiece_project.business)+1
                timepiece_issue.save()
                timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "Imported from jira", "", timepiece_issue.subject)
            except timepiece.Issue.MultipleObjectsReturned:
                timepiece_issue = timepiece.Issue.objects.filter(interface_plugin_number=jira_issue.key)[0]

            if timepiece_issue.project != timepiece_project:
                timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "Moved from sprint %s during jira import" % timepiece_issue.project.name,
                                                   timepiece_issue.status, state)
                timepiece_issue.project = timepiece_project

            if timepiece_issue.status != state:
                timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "State change during jira import", timepiece_issue.status, state)
                timepiece_issue.status = state

            # if (timepiece_issue.order != order or timepiece_issue.order2 != order2) and self.settings.sync_issue_ordering_from_jira:
            #     timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "Order change during jira import", timepiece_issue.order, order)
            #     timepiece_issue.order = order
            #     timepiece_issue.order2 = order2

            if timepiece_issue.interface_plugin_number != jira_issue.key:
                timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "Key change during jira import", timepiece_issue.interface_plugin_number, jira_issue.key)
                timepiece_issue.interface_plugin_number = jira_issue.key

            if timepiece_issue.subject != fixed_subject:
                timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "Subject change during jira import", timepiece_issue.subject, fixed_subject)
                timepiece_issue.subject = fixed_subject

            if timepiece_issue.description != jira_issue.fields.description:
                timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "Description change during jira import", timepiece_issue.description, jira_issue.fields.description or "")
                timepiece_issue.description = jira_issue.fields.description or ""

            if hasattr(jira_issue.fields, 'assignee') and jira_issue.fields.assignee:
                timepiece_assigned_user = self._get_or_create_timepiece_equivalent_of_jira_user(jira_issue.fields.assignee)
                if timepiece_issue.assigned_to != timepiece_assigned_user:
                    timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "Assignee change during jira import", timepiece_issue.assigned_to, timepiece_assigned_user)
                    timepiece_issue.assigned_to = timepiece_assigned_user

                if timepiece_issue.get_assigned_hours_estimate()[0] != time_estimate:
                    timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "Time estimate changed during jira import", timepiece_issue.get_assigned_hours_estimate()[0], time_estimate)
                    timepiece_issue.set_assigned_hours_estimate(time_estimate)

            if timepiece_issue.story_points != jira_issue.fields.timeestimate:
                timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "Points change during jira import", timepiece_issue.story_points, jira_issue.fields.timeestimate)
                timepiece_issue.story_points = jira_issue.fields.timeestimate

            # Jira doesn't distinguish between points per user, so set for all estimateable users
            for bp in self.timepiece_business.get_all_business_permissions():
                if bp.has_estimate_own_points:
                    timepiece_issue.set_points(bp.user, time_estimate)

            if hasattr(jira_issue.fields, 'duedate') and jira_issue.fields.duedate:
                jira_due_date = datetime.strptime(jira_issue.fields.duedate, "%Y-%m-%d")
                if timepiece_issue.due_date != jira_due_date:
                    timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "Due date changed", timepiece_issue.due_date, jira_issue.fields.duedate)
                    timepiece_issue.due_date = jira_issue.fields.duedate

            timepiece_issue.save()

            if hasattr(jira_issue.fields, 'comment') and jira_issue.fields.comment.comments:
                for jira_comment in jira_issue.fields.comment.comments:
                    try:
                        timepiece.IssueComment.objects.get(issue=timepiece_issue, comment__icontains=jira_comment.body)
                    except timepiece.IssueComment.DoesNotExist:
                        author = self._get_or_create_timepiece_equivalent_of_jira_user(jira_comment.author)
                        created = dateparser.parse(jira_comment.created)
                        new_comment = timepiece.IssueComment.objects.create(issue_id=timepiece_issue.id,
                                                                            comment=jira_comment.body,
                                                                            author=author)
                        timepiece.IssueComment.objects.filter(pk=new_comment.id).update(created=created)
                        timepiece.IssueHistory.add_history(self.active_user, timepiece_issue, "Comment added during jira import", "", jira_comment.body)
                    except timepiece.IssueComment.MultipleObjectsReturned:
                        pass
            return timepiece_issue

        except Exception as ex:
            self._on_error(ex)
            raise


    def _get_or_create_timepiece_equivalent_of_jira_user(self, jira_username):
        try:
            return JiraUser.objects.get(jira=self.jira_settings, jira_username=jira_username.name).timepiece_user
        except JiraUser.DoesNotExist:
            logger.warning("Auto creating a limited-privileges user who is assigned to a jira issue")
            jira_internal_timepiece_username = ("fj_%s" % jira_username.name)[:30]
            try:
                user = User.objects.get(username=jira_internal_timepiece_username)
            except User.DoesNotExist:
                user = User.objects.create(username=jira_internal_timepiece_username)
                timepiece.UserProfile.objects.create(user=user)
                messages.info(self.request, "Auto created user %s (id=%d)" % (user, user.id))
            return user

    def add_issue_comment(self, timepiece_comment):
        if not self._connect():
            return
        jira_issue = self._get_jira_issue(timepiece_comment.issue)
        self.jira.add_comment(jira_issue, timepiece_comment.comment)

    def edit_issue_comment(self, timepiece_comment):
        if not self._connect():
            return
        jira_issue = self._get_jira_issue(timepiece_comment.issue)

        # TODO: implement this properly
        self.jira.add_comment(jira_issue, "(Edit of previous comment)\n" + timepiece_comment.comment)

    def delete_issue_comment(self, timepiece_comment):
        # TODO: implement this
        pass

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

        transition = [ t for t in transitions if t['id'] == timepiece_issue.status2.name ][0]
        self.jira.transition_issue(jira_issue, transitionId=transition['id'])

        timepiece_issue.status = transition['name']
        timepiece_issue.save()

    def update_issue_points(self, issue_points):
        if not self._connect():
            return

        if not self.request or issue_points.issue.assigned_to != self.user:
            return

        jira_issue = self._get_jira_issue(issue_points.issue)
        timepiece_estimated_seconds = int(issue_points.points*60*60)

        if timepiece_estimated_seconds != jira_issue.fields.timeestimate:
            jira_estimate_pattern = u'%dm' % (float(issue_points.points)*60)
            try:
                jira_issue.update(timetracking={'originalEstimate': jira_estimate_pattern})
            except Exception as ex:
                self._on_error(ex)
                raise

    def update_issue_actual_hours(self, timepiece_issue, jira_issue=None):
        if not self._connect():
            return
        if not self.settings.sync_actual_times:
            return
        if not timepiece_issue.interface_plugin_number:
            return

        jira_issue = jira_issue or self._get_jira_issue(timepiece_issue)
        timepiece_actual_seconds = int((timepiece_issue.hours or 0)*60*60)
        if timepiece_actual_seconds != (jira_issue.fields.timespent or 0):

            # compare each worklog with each timepiece-jira-enabled
            # user that has entries for this issue, and create them.
            worklogs = self.jira.worklogs(jira_issue)

            worklog_seconds_grouped_by_user = {}
            for worklog in worklogs:
                worklog_timepiece_user = self._get_or_create_timepiece_equivalent_of_jira_user(worklog.author)
                worklog_seconds_grouped_by_user.setdefault(worklog_timepiece_user, 0)
                worklog_seconds_grouped_by_user[worklog_timepiece_user] += worklog.timeSpentSeconds

            timepiece_entry_totals_by_user = timepiece_issue.entries.all().values("user").annotate(Sum("hours"))
            for timepiece_entry_totals_for_user in timepiece_entry_totals_by_user:
                timepiece_entry_user = User.objects.get(pk=timepiece_entry_totals_for_user['user'])
                bp = timepiece.BusinessPermissions.for_user(timepiece_entry_user, timepiece_issue.project.business)
                if not bp.has_import_actual_hours:
                    continue
                timepiece_seconds = float(timepiece_entry_totals_for_user['hours__sum'])*60*60

                if timepiece_entry_user in worklog_seconds_grouped_by_user.keys():
                    jira_seconds = worklog_seconds_grouped_by_user[timepiece_entry_user]
                    if timepiece_seconds < jira_seconds:
                        # Typically as a result of a timesheet correction in imptime, delete all jira worklogs in this case and start again.
                        jira_for_user = self._create_jira_connection_for_user(timepiece_issue.project.business, timepiece_entry_user)['jira']
                        for worklog in worklogs:
                            if self._get_or_create_timepiece_equivalent_of_jira_user(worklog.author).id == timepiece_entry_user.id:
                                logger.info("Deleting worklog: name=%s, hours=%s, started=%s" % (worklog.author.name, worklog.timeSpentSeconds, worklog.started))
                                jira_for_user.delete_worklog(jira_issue, worklog)
                        missing_seconds = timepiece_seconds
                    else:
                        missing_seconds = timepiece_seconds - jira_seconds
                else:
                    missing_seconds = timepiece_seconds

                if missing_seconds > 0:
                    jira_hours_pattern = u'%fm' % float(missing_seconds/60)
                    jira_for_user = self._create_jira_connection_for_user(timepiece_issue.project.business, timepiece_entry_user)['jira']
                    jira_for_user.add_worklog(jira_issue, timeSpent=jira_hours_pattern)

    def update_issue_assigned_to(self, timepiece_issue, username, *args, **kwargs):
        if not self._connect():
            return
        if timepiece_issue.interface_plugin_number is None:
            return
        jira_issue = self._get_jira_issue(timepiece_issue)

        business = timepiece_issue.project.business
        try:
            settings = business.jira.get_query_set().all()[0]
        except IndexError:
            raise Exception("No jira configuration for this business")
        timepiece_user = User.objects.get(username=username)
        user_settings = settings.get_user_settings(timepiece_user)

        if timepiece_issue.assigned_to is None:
            try:
                timepiece_issue.assigned_to = timepiece_user
                timepiece_issue.save()
            except User.DoesNotExist:
                return

        self.jira.assign_issue(jira_issue, user_settings.jira_username)

    def create_issue(self, timepiece_issue, jira_create_issue_form):
        if not self._connect():
            return

        jira_project_key = jira_create_issue_form.cleaned_data['project']
        jira_issue_type_name = jira_create_issue_form.cleaned_data['issue_type']
        jira_assignee = jira_create_issue_form.cleaned_data['assigned_to']

        jira_issue = self.jira.create_issue(project={'key': jira_project_key}, summary=timepiece_issue.subject,
                                            description=timepiece_issue.description, issuetype={'name': jira_issue_type_name},
                                            assignee={'name':jira_assignee})
        timepiece_issue.interface_plugin_number = jira_issue.key
        timepiece_issue.subject="%s %s" % (jira_issue.key, jira_issue.fields.summary)
        timepiece_issue.save()

        try:
            self.gh.add_issues_to_sprint(timepiece_issue.project.interface_plugin_number, [jira_issue.key],
                                         rankFieldId=self.settings.custom_field_name_for_issue_order)
        except Exception as ex:
            logger.exception(ex)
            logger.info("Couldn't add the issue to the sprint, probably because the sprint is closed: %s" % ex)

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

    def move_issue(self, timepiece_issue, old_project):

        if not self._connect():
            return None
        if timepiece_issue.interface_plugin_number is None:
            return

        if old_project == timepiece_issue.project and not self.settings.sync_issue_ordering_to_jira:
            # Synching of reorders within a sprint aren't sent to jira
            return

        try:
            timepiece_issue_moved_after_key = timepiece_issue.project.issues.all().filter(Q(order__lt=timepiece_issue.order)|Q(order2__lt=timepiece_issue.order2)) \
                                                                                              .order_by("-order", "-order2")[0].interface_plugin_number
            timepiece_issue_moved_before_key = None
        except IndexError:
            timepiece_issue_moved_after_key = None
            try:
                timepiece_issue_moved_before_key = timepiece_issue.project.issues.all().filter(Q(order__gte=timepiece_issue.order)|Q(order2__gte=timepiece_issue.order))\
                                                                                              .order_by("order", "order2")[0].interface_plugin_number
            except IndexError:
                # Means there's only one issue in the sprint
                return

        try:
            self.gh.move_issue(sprint_id=timepiece_issue.project.interface_plugin_number,
                               issue_key=timepiece_issue.interface_plugin_number,
                               move_after_issue_key=timepiece_issue_moved_after_key,
                               move_before_issue_key=timepiece_issue_moved_before_key,
                               rankFieldId=self.settings.custom_field_name_for_issue_order)
        except Exception as ex:
            # most likely reason is
            #  JIRAError: HTTP 400: "This issue cannot be edited because of its workflow status."
            logger.exception(ex)
            return

    def issue_moved_projects(self, timepiece_issue, *args, **kwargs):
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
