import os
import fnmatch
import git
from implicitdesign import settings
from timepiece.interface_plugin import get_interface_plugin
from orgnode import makelist
from django.db import transaction
from django.contrib.auth.models import User
from timepiece.models import Business, Project, Activity, Entry, Location, Attribute, Issue
import logging
logger = logging.getLogger(__name__)

class Extractor(object):

    def __init__(self, username, root_input_folder, pointperson_username):
        self.username = username
        self.pointperson_username = pointperson_username
        self.input_path = os.path.join(root_input_folder, self.username)
        self.status = {'errors':[],
                       'infos':[],
                       'num_entries_created':0}

    def get_project_timings_for_user(self):
        timesheet_user = User.objects.get(username=self.username)
        timings = {}
        for p in Project.objects.all():
            timings[p.id] = p.total_hours_for_user(user=timesheet_user)
        return timings

    def refresh_from_git(self):
        if not os.path.exists(self.input_path):
            logger.debug("Invalid timesheet path: %s" % self.input_path)
            return
        logger.debug("Pulling timesheet path: %s" % self.input_path)
        try:
            repo = git.Repo(self.input_path)
            repo.remotes.origin.pull()
        except Exception, ex:
            logger.exception(ex)
            logger.error("Failed to pull from origin")
            raise
        logger.debug("Pulled timesheet path: %s" % self.input_path)
    
    def extract(self):

        with transaction.commit_manually():

            try:
                self.timings_before = self.get_project_timings_for_user()
                self._clean_clocktable_entries()
                includes = ["*.org",]
                excludes = [".git",]
                for root, dirs, files in os.walk(self.input_path, topdown=True):
                    dirs[:] = [d for d in dirs if d not in excludes] 
                    for pat in includes:
                        for f in fnmatch.filter(files, pat):
                            try:
                                self._handle_file(root, f)
                            except Exception, ex:
                                self.status['errors'].append("%s: Failure handling file [%s]: %s" % (self.username, f, ex))
                self.timings_after = self.get_project_timings_for_user()

                try:
                    self.check_changed_closed_projects()
                except Exception, ex:
                    self.status['errors'].append("%s: General failure: %s" % (self.username,ex))
                
            finally:
                if len(self.status['errors'])==0:
                    transaction.commit()
                else:
                    transaction.rollback()

        return self.status

    def check_changed_closed_projects(self):
        for p_id, hours_before in self.timings_before.items():
            hours_after = self.timings_after[p_id]
            if hours_before != hours_after:
                project = Project.objects.get(pk=p_id)
                if not project.is_open:
                    self.status['infos'].append("Adding entries to a closed project [%s - %s]. Expected %s hours, but trying to add %s hours." % (project.business.name, project, hours_before, hours_after))

    def _handle_file(self, dirname, fname):
        is_valid_timesheet_file = fname[-4:] == ".org" and fname[0] != "." and fname[0] != "#"
        if is_valid_timesheet_file:
            self._process_org_file(dirname, fname)
    
    def _clean_clocktable_entries(self):
        Entry.objects.all().filter(user__username=self.username).delete()
                    
    def _process_org_file(self, dirname, fname):
        filepath = os.path.join(dirname, fname)
        orgnodes = makelist(filepath)
        sprint_name = None
        business_name = fname.replace(".org", "").replace("id-", "")

        timesheet_user = User.objects.get(username=self.username)

        issues_processed = set()
        for orgnode in orgnodes:
            if orgnode.Level() == 2:
                sprint_name = orgnode.Heading()
            if orgnode.Level() >= 3 and len(orgnode.getClocks())>0 and sprint_name is not None:
                self._process_orgnode(business_name, sprint_name, orgnode, issues_processed)

        for issue in issues_processed:
            try:
                get_interface_plugin(request=None, business=issue.project.business, user=timesheet_user).update_issue_actual_hours(timepiece_issue=issue)
            except Exception, ex:
                logger.exception(ex)
                self.status['infos'].append("Couldn't update actual time in the interface because: %s" % ex)

    def _process_orgnode(self, business_name, sprint_name, orgnode, issues_processed):
        #point_person = User.objects.get_or_create(username=self.pointperson_username)[0]
        activity = Activity.objects.get_or_create(code='dev')[0]
        try:
            timesheet_user = User.objects.get(username=self.username)
        except User.DoesNotExist:
            timesheet_user = User.objects.create(username=self.username, first_name=self.username)
        location = Location.objects.get_or_create(name='office')[0]
        # try:
        #     project_status = Attribute.objects.get(type='project-status', label='open')
        # except: 
        #     project_status = Attribute.objects.create(type='project-status', label='open', billable=True, enable_timetracking=True)
        # try:
        #     project_type = Attribute.objects.get(type='project-type', label='default')
        # except:
        #     project_type = Attribute.objects.create(type='project-type', label='default', billable=True, enable_timetracking=True)
        
        try:
            business = Business.objects.get(name=business_name)
        except Business.DoesNotExist:
            raise Exception("No project found with name: %s" % business_name) #sic, businesses are called projects

        try:
            project = Project.get_project_from_name(name=sprint_name, business=business)
        except Project.DoesNotExist:
            raise Exception("No sprint found for [%s] in business %s" % (sprint_name, business.name)) #sic, sprints are called projects

        for clock in orgnode.getClocks():
            
            entry = Entry.objects.create(user=timesheet_user, 
                                         start_time=clock['from'], end_time=clock['to'],
                                         activity=activity,
                                         location=location,
                                         project=project,
                                         status='approved',
                                         comments=orgnode.Heading(),
                                         extended_comments=orgnode.CleanBody())

            issue_id = entry.try_get_issue_id()
            if issue_id is not None:
                try:
                    # this filter allows that issues could be in the wrong sprint, but they must be in the right business
                    issue = Issue.objects.get(number=issue_id, project__business=project.business) 
                except Issue.DoesNotExist:
                    issue = None
                    pass
                except Issue.MultipleObjectsReturned:
                    issue = Issue.objects.filter(number=issue_id, project__business=project.business).order_by("-interface_plugin_number", "-id")[0]

                if issue is not None:
                    entry.issue = issue
                    entry.project = issue.project
                    entry.save()
                    issues_processed.add(issue)

            self.status['num_entries_created'] += 1
