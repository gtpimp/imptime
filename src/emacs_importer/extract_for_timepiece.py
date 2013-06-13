import os
import fnmatch
from implicitdesign import settings
from orgnode import makelist
from django.contrib.auth.models import User
from timepiece.models import Business, Project, Activity, Entry, Location, Attribute
import logging
logger = logging.getLogger(__name__)

class Extractor(object):

    def __init__(self, username, root_input_folder, pointperson_username):
        self.username = username
        self.pointperson_username = pointperson_username
        self.input_path = os.path.join(root_input_folder, self.username)
        self.status = {'errors':[],
                       'num_entries_created':0}

    def get_project_timings_for_user(self):
        timesheet_user = User.objects.get(username=self.username)
        timings = {}
        for p in Project.objects.all():
            timings[p.id] = p.total_hours_for_user(user=timesheet_user)
        return timings

    def extract(self):
        self.timings_before = self.get_project_timings_for_user()
        self._clean_clocktable_entries()
        includes = ["*.org",]
        excludes = [".git",]
        for root, dirs, files in os.walk(self.input_path, topdown=True):
            dirs[:] = [d for d in dirs if d not in excludes] 
            for pat in includes:
                for f in fnmatch.filter(files, pat):
                    self._handle_file(root, f)
        self.timings_after = self.get_project_timings_for_user()
        self.reopen_changed_projects()

    def reopen_changed_projects(self):
        try:
            reopened_status = Attribute.objects.get(type='project-status', label='reopened')
        except: 
            reopened_status = Attribute.objects.create(type='project-status', label='reopened', billable=True, enable_timetracking=True)

        for p_id, hours_before in self.timings_before.items():
            hours_after = self.timings_after[p_id]
            if hours_before != hours_after:
                project = Project.objects.get(pk=p_id)
                if not project.is_open:
                    logger.debug("reopening project %s" % project)
                    project.status = reopened_status
                    project.save()

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
        for orgnode in orgnodes:
            if orgnode.Level() == 2:
                sprint_name = orgnode.Heading()
            if orgnode.Level() >= 3 and len(orgnode.getClocks())>0 and sprint_name is not None:
                self._process_orgnode(business_name, sprint_name, orgnode)

    def _process_orgnode(self, business_name, sprint_name, orgnode):
        point_person = User.objects.get_or_create(username=self.pointperson_username)[0]
        activity = Activity.objects.get_or_create(code='dev')[0]
        try:
            timesheet_user = User.objects.get(username=self.username)
        except User.DoesNotExist:
            timesheet_user = User.objects.create(username=self.username, first_name=self.username)
        location = Location.objects.get_or_create(name='office')[0]
        try:
            project_status = Attribute.objects.get(type='project-status', label='open')
        except: 
            project_status = Attribute.objects.create(type='project-status', label='open', billable=True, enable_timetracking=True)
        try:
            project_type = Attribute.objects.get(type='project-type', label='default')
        except:
            project_type = Attribute.objects.create(type='project-type', label='default', billable=True, enable_timetracking=True)
        
        try:
            business = Business.objects.get(name=business_name)
        except Business.DoesNotExist:
            business = Business.objects.create(name=business_name,
                                               slug=business_name.replace(" ","_"),
                                               email="%s@implicitdesign.co.za"%business_name.replace(" ","_"),
                                               description="(auto_created from timesheets")

        try:
            code = Project.get_code_from_name(sprint_name)
            project = Project.objects.get(code=code, business=business)
        except Project.DoesNotExist:
            project = Project.objects.create(name=sprint_name, business=business, 
                                             point_person=point_person,
                                             status=project_status, type=project_type,
                                             billable=True,
                                             description=sprint_name + " (auto_created)",
                                             code=code)

        for clock in orgnode.getClocks():
            
            entry = Entry.objects.create(user=timesheet_user, 
                                         start_time=clock['from'], end_time=clock['to'],
                                         activity=activity,
                                         location=location,
                                         project=project,
                                         status='approved',
                                         comments=orgnode.Heading())
            self.status['num_entries_created'] += 1
            #logger.debug("Created new entry: %s %s %s %s : %s" % (business, project, clock['from'], clock['to'], entry))
