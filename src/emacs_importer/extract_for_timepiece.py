import os
import fnmatch
from django.db.models import Q, Avg, Sum, Max, Min, F
import git
from implicitdesign import settings
from timepiece.interface_plugin import get_interface_plugin
from orgnode import makelist_from_file, makelist_from_string
from django.db import transaction
from django.contrib.auth.models import User
from timepiece.models import Business, Project, Activity, Entry, Location, Attribute, Issue
import logging
logger = logging.getLogger(__name__)

class Extractor(object):

    def __init__(self, username, root_input_folder=None, pointperson_username='deprecated'):
        self.username = username
        if root_input_folder:
            self.input_path = os.path.join(root_input_folder, self.username)
        self.status = {'errors':[],
                       'infos':[],
                       'num_entries_refreshed':0,
                       'num_issues_created':0}

    def get_project_timings_for_user(self, business):
        timesheet_user = User.objects.get(username=self.username)
        timings = {}
        projects = Project.objects.filter(business=business)
        for p in projects:
            hours_per_issue = Entry.objects.filter(issue__project=p, user=timesheet_user).order_by('issue__order', 'issue__number').values('issue').annotate(hours=Sum('hours'))

            hours_by_issue = {}
            for x in hours_per_issue:
                hours_by_issue[x['issue']] = x['hours']
            timings[p.id] = { 'total_hours': p.total_hours_for_user(user=timesheet_user),
                              'hours_by_issue': hours_by_issue }
            
        return timings

    def extract_for_filecontent(self, filename, file_content):
        self._process_org_string(file_content, filename)
        return self.status
            
    # def extract(self):

    #     with transaction.commit_manually():

    #         try:
    #             self.timings_before = self.get_project_timings_for_user()
    #             includes = ["*.org",]
    #             excludes = [".git",]
    #             for root, dirs, files in os.walk(self.input_path, topdown=True):
    #                 dirs[:] = [d for d in dirs if d not in excludes] 
    #                 for pat in includes:
    #                     for f in fnmatch.filter(files, pat):
    #                         try:
    #                             self._handle_file(root, f)
    #                         except Exception, ex:
    #                             self.status['errors'].append("%s: Failure handling file [%s]: %s" % (self.username, f, ex))
    #             self.timings_after = self.get_project_timings_for_user()

    #             try:
    #                 self.check_changed_closed_projects()
    #             except Exception, ex:
    #                 self.status['errors'].append("%s: General failure: %s" % (self.username,ex))
                
    #         finally:
    #             if len(self.status['errors'])==0:
    #                 transaction.commit()
    #             else:
    #                 transaction.rollback()

    #     return self.status

    def check_changed_closed_projects(self):

        for p_id, info_before in self.timings_before.items():
            info_after = self.timings_after[p_id]
            if info_before['total_hours'] != info_after['total_hours']:
                project = Project.objects.get(pk=p_id)
                if not project.can_add_dev_time():
                    failures = []
                    for issue in project.issues.all().order_by("order", "number").values('pk', 'number'):
                        hours_before = info_before['hours_by_issue'].get(issue['pk'], 0)
                        hours_after = info_after['hours_by_issue'].get(issue['pk'], 0)
                        if hours_before != hours_after:
                            failures.append( "On issue%s in %s : was %s hours, now %s hours" % (issue['number'], project.long_name(), hours_before, hours_after) )

                    self.status['infos'].append("Dev time was changed for a closed sprint in status %s: %s. Expected %s hours, but changed to %s hours. Please check if this is right. %s\n" % \
                                                 (project.status2, project.long_name(), info_before['total_hours'], info_after['total_hours'], "\n  ".join(failures)))

    def _handle_file(self, dirname, fname):
            self._process_org_file(dirname, fname)
    
    def _process_org_file(self, dirname, filename):
        filepath = os.path.join(dirname, filename)
        orgnodes = makelist_from_file(filepath)
        return self._process_org_nodes(orgnodes, filename=filename)

    def _process_org_string(self, s, filename):
        orgnodes = makelist_from_string(s)
        return self._process_org_nodes(orgnodes, filename=filename)

    def _process_org_nodes(self, orgnodes, filename):

        is_valid_timesheet_file = filename[-4:] == ".org" and filename[0] != "." and filename[0] != "#"
        if not is_valid_timesheet_file:
            logger.error("Not a timesheet file: %s" % filename)
            return
        business_name = filename.replace(".org", "").replace("id-", "")

        try:
            business = Business.objects.get(name=business_name)
        except:
            business = None

        timesheet_user = User.objects.get(username=self.username)

        self.timings_before = {}
        if business:
            self.timings_before = self.get_project_timings_for_user(business=business)
            Entry.objects.all().filter(user=timesheet_user, issue__project__business=business, source='emacs').delete()

        sprint_name = None

        issues_processed = set()
        section_name = None
        for orgnode in orgnodes:
            if orgnode.Level() == 1:
                section_name = orgnode.Heading().lower().strip()

            if section_name is None:
                raise Exception("Invalid timesheet, missing a one star section called")
            if section_name != "development":
                continue
                
            if orgnode.Level() == 2:
                sprint_name = orgnode.Heading()

            if orgnode.Level() >= 3 and sprint_name is not None:

                if business is None:
                    logger.error("Found a development section for a project which doesn't exist: %s" % business_name)
                    self.status['infos'].append("Found a development section for a project which doesn't exist: %s" % business_name)
                    return
                
                self._process_orgnode(business, sprint_name, orgnode, issues_processed)

        for issue in issues_processed:
            try:
                get_interface_plugin(request=None, business=issue.project.business, user=timesheet_user).update_issue_actual_hours(timepiece_issue=issue)
            except Exception, ex:
                logger.exception(ex)
                self.status['infos'].append("Couldn't update actual time in the interface because: %s" % ex)

        self.timings_after = self.get_project_timings_for_user(business=business)
        self.check_changed_closed_projects()
                
    def _process_orgnode(self, business, sprint_name, orgnode, issues_processed):
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
            project = Project.get_project_from_name(name=sprint_name, business=business)
        except Project.DoesNotExist:
            raise Exception("No sprint found for [%s] in business %s" % (sprint_name, business.name)) #sic, sprints are called projects

        issue_id = Issue.extract_issue_id(orgnode.headline)

        if issue_id is not None:
            try:
                # this filter allows that issues could be in the wrong sprint, but they must be in the right business
                issue = Issue.objects.get(number=issue_id, project__business=project.business) 
            except Issue.DoesNotExist:
                issue = None

            except Issue.MultipleObjectsReturned:
                issue = Issue.objects.filter(number=issue_id, project__business=project.business).order_by("-interface_plugin_number", "-id")[0]

        if issue_id is None or issue is None:
            # Auto create the issue
            try:
                issue, is_new = Issue.objects.get_or_create(project=project,
                                                            subject=orgnode.Heading(),
                                                            defaults={'auto_created_during_import':True,
                                                                      'adhoc':True,
                                                                      'status':'imported',
                                                                      'assigned_to':timesheet_user,
                                                                      'number':Issue.get_next_issue_number(project.business),
                                                                      'description':orgnode.CleanBody(),
                                                                      'story_points':0,
                                                                      'order':Issue.get_next_order(project)})
                if is_new:
                    self.status['num_issues_created'] += 1
            except Issue.MultipleObjectsReturned:
                issue = Issue.objects.filter(status='new',project=project, subject=orgnode.Heading())[0]
        
        # Insert the clock entries
        for clock in orgnode.getClocks():
            Entry.objects.create(user=timesheet_user,
                                 source='emacs',
                                 start_time=clock['from'], end_time=clock['to'],
                                 activity=activity,
                                 location=location,
                                 issue=issue,
                                 status='approved',
                                 comments=orgnode.Heading(),
                                 extended_comments=orgnode.CleanBody())

            if issue is not None:

                if issue.assigned_to is None:
                    issue.assigned_to = timesheet_user
                    issue.save()
                
                issues_processed.add(issue)

            self.status['num_entries_refreshed'] += 1
