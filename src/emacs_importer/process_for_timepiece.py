import sys
import os
import fnmatch, re
import json
import copy
from implicitdesign import settings
import calendar
from django.contrib.auth.models import User
from timepiece.models import Business, Project, Activity, Entry, Location, Attribute
from datetime import *
from dateutil.relativedelta import relativedelta
import calendar
import csv
import subprocess
import smtplib
from models import RedmineTimeEntry, redmine_mapping
from email.MIMEMultipart import MIMEMultipart
from email.MIMEBase import MIMEBase
from email.mime.image import MIMEImage
from email.MIMEText import MIMEText
from email.Utils import COMMASPACE, formatdate
from email import Encoders
import zipfile
import logging
logger = logging.getLogger(__name__)

class Processor(object):
    
    email_from = "gtp@implicitdesign.co.za"
    email_to = settings.EMACS_ADMIN_USER_EMAILS
    
    def __init__(self, user="test", user_email="fake@implicitdesign.co.za", 
                 root_folder = '.', email_from='gtp@implicitdesign.co.za', 
                 num_historical_days=60, 
                 pointperson_username='test',
                 rates_info = {'test':{}},
                 ref_current_date = None,
                 step = ":step day",
                 maxlevel = 3):
        self.user = user
        self.user_email = user_email
        self.root_folder = root_folder
        self.input_path = os.path.join(self.root_folder, "input", self.user)
        self.num_historical_days = num_historical_days
        self.pointperson_username = pointperson_username
        self.ref_current_date = ref_current_date or datetime.today()
        self.step = step
        self.maxlevel = maxlevel

        if not os.path.exists(self.input_path):
            logger.error(Exception("No user input file at %s " % self.input_path))

        self.load_rates(rates_info)

    def load_rates(self, rates_info):
        self.user_rates = rates_info[self.user]

    def process(self):
        tstart = self.ref_current_date - timedelta(days=self.num_historical_days) 
        tend = self.ref_current_date
        return self.generate_incremental(from_date=tstart, to_date=tend)

    def generate_incremental(self, from_date, to_date=None, only_these_files=None, import_clocktable_entries=True):
        tstart = from_date
        tend = to_date or datetime.today()
        
        self.clean_clocktable_entries(self.user, tstart, tend)
        self.status = { 'from': tstart.strftime("%Y-%m-%d %a"),
                        'to': tend.strftime("%Y-%m-%d %a"),
                        'num_entries_created' : 0,
                        'num_redmine_entries_created' : 0,
                        'num_entries_deleted' : 0,
                        'num_entries_updated' : 0,
                        'num_entries_unchanged' : 0,
                        'unknown_redmine_entries' : [] }

        self.update_input_folder()
        
        self.clocktable_raws = []

        def handle_file(dirname, fname):
            only_include_rated_files = True

            is_valid_timesheet_file = fname[-4:] == ".org" and fname[0] != "." and fname[0] != "#" and \
                ( not only_include_rated_files or fname in self.user_rates.keys()) and \
                (only_these_files is None or fname in only_these_files)

            if is_valid_timesheet_file:
                temp_filename = self.process_file(dirname, fname, tstart, tend, import_clocktable_entries=import_clocktable_entries)
                self.clocktable_raws.append(self.extract_clocktable_entries_raw(temp_filename))
            else:
                logger.debug("%s: Ignoring : %s" % (self.user,fname))

        logger.debug( "looking for timesheet files in %s" % self.input_path)

        includes = ["*.org",]
        excludes = [".git",]
        for root, dirs, files in os.walk(self.input_path, topdown=True):
            dirs[:] = [d for d in dirs if d not in excludes] 
            for pat in includes:
                for f in fnmatch.filter(files, pat):
                    handle_file(root, f)

        logger.debug( "Import process complete")
        return self.status

    def update_input_folder(self):
        if self.user == "test":
            #'test' doesn't have a git repo, and we don't want to reset our code during development
            return

        process_args = [os.path.join(self.root_folder, 'reset_input_folder.sh'), self.input_path]
        p = subprocess.Popen(process_args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        p.wait()

    def process_file(self, dirname, fname, tstart, tend, import_clocktable_entries=True):

        filepath = os.path.join(dirname, fname)

        self.output_path = settings.EMACSIMPORTER_TEMP_DIR
        self.temp_filename = os.path.join(self.output_path, "temp.org")

        self.create_clocktable_file(filepath, self.temp_filename, tstart, tend)
        self.create_clocktable(self.temp_filename)
        if import_clocktable_entries:
            clocktable_entries, issue_clocktable_entries = self.extract_clocktable_entries(self.temp_filename)
            self.import_clocktable_entries_for_timepiece(fname, clocktable_entries)
            self.import_clocktable_entries_for_redmine(fname, issue_clocktable_entries)
        return self.temp_filename
        
    def create_clocktable_file(self, input_file, output_file, tstart, tend):
        date_format = "%Y-%m-%d %a"
        clocktable_def = '#+BEGIN: clocktable :maxlevel %d :scope file :link nil :tstart "<%s>" :tend "<%s>" %s\n#+END:\n' % (self.maxlevel, tstart.strftime(date_format), tend.strftime(date_format), self.step)
        f = open(output_file, "w")
        f.write(clocktable_def)
        f.write(open(input_file).read())

    def create_clocktable(self, input_file):

        cmd = '''(list
                   (find-file "%s")
                   (org-clock-report)
                   (save-buffer)
                 )''' % input_file

        logger.debug("Running emacs on %s..." % input_file)
        process_args = ['emacs', '--batch', '--kill', '--eval', cmd]
        p = subprocess.Popen(process_args, stdout=subprocess.PIPE)
        while 1:
            line = p.stdout.readline()
            if not line:
                break
            logging.info( line )
            print(line)
        p.wait()
        logger.debug("Emacs done")

    def clean_clocktable_entries(self, user, tstart, tend):
        Entry.objects.all().filter(user__username=user).filter(start_time__gte=tstart).filter(end_time__lte=tend).delete()
        RedmineTimeEntry.delete_for_user_and_daterange(username=user, start_time=tstart, end_time=tend)
        logger.debug("Wiping for %s from %s to %s" % (user, tstart, tend))

    def extract_clocktable_entries_raw(self, input_file):
        f = open(input_file)
        f.readline() 
        output = []

        for line in f:
            if "#+END" in line:
                return "".join(output)
            output.append(line)
        raise Exception("Shouldn't get here")

    def extract_clocktable_entries(self, input_file):
        f = open(input_file)
        f.readline() 
        clocktable_entries = []
        issue_clocktable_entries = []

        current_sprint_name = None

        def get_start_end_for_clocktable_line(time_part):
            hours, minutes = sprint_time.split(":")
            minutes = 60*int(hours) + int(minutes)
            started = start_date
            ended = started + timedelta(minutes=minutes)
            return started, ended

        for line in f:
            time_parts = line.split("|")
            if "#+END" not in line and ():
                continue

            if "Daily report" in line:
                start_date = datetime.strptime(line[-16:-6], "%Y-%m-%d")
                start_date = datetime(start_date.year, start_date.month, start_date.day, 3, 0)

            elif "#+END" in line:
                return clocktable_entries, issue_clocktable_entries
            elif len(time_parts)<2 or time_parts[1].strip() == 'L' or '*Total time*' in line:
                continue
            elif len(time_parts) >= 6:
                level = int(time_parts[1].strip())
                description = time_parts[2].strip()
                if level == 2:
                    sprint_time = time_parts[4].strip()
                    current_sprint_name = description.replace("INVOICED","").replace("INVOICE","").replace("TODO","").replace("STARTED","").replace("WAITING","").replace("PAID","")
                    if len(sprint_time)>0:
                        started, ended = get_start_end_for_clocktable_line(sprint_time)
                        clocktable_entries.append( {'sprint': current_sprint_name,
                                                    'issue': "daily dev",
                                                    'started': started,
                                                    'ended': ended } )
                elif level == 3:
                    issue_time = time_parts[5].strip()
                    started, ended = get_start_end_for_clocktable_line(issue_time)
                    issue_clocktable_entries.append( {'sprint': current_sprint_name,
                                                      'issue': description,
                                                      'started': started,
                                                      'ended': ended } )
            
        raise Exception("Shouldn't get here")


    def import_clocktable_entries_for_timepiece(self, fname, clocktable_entries):
        point_person = User.objects.get_or_create(username=self.pointperson_username)[0]
        activity = Activity.objects.get_or_create(code='dev')[0]
        business_name = fname.replace(".org", "").replace("id-", "")
        try:
            timesheet_user = User.objects.get(username=self.user)
        except User.DoesNotExist:
            timesheet_user = User.objects.create(username=self.user, first_name=self.user)
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

        for clocktable_entry in clocktable_entries:
            project_name = clocktable_entry['sprint']
            try:
                project = Project.objects.get(name=project_name, business=business)
            except Project.DoesNotExist:
                project = Project.objects.create(name=project_name, business=business, 
                                                 point_person=point_person,
                                                 status=project_status, type=project_type,
                                                 description=project_name + " (auto_created)")

            entry = Entry.objects.create(user=timesheet_user, 
                                         start_time=clocktable_entry['started'], end_time=clocktable_entry['ended'],
                                         activity=activity,location=location,project=project,
                                         status='approved',
                                         comments='auto_created')
            self.status['num_entries_created'] += 1
            logger.debug("Created new entry: %s %s %s %s : %s" % (business, project, clocktable_entry['started'], 
                                                                  clocktable_entry['ended'], entry))
            

    def import_clocktable_entries_for_redmine(self, fname, clocktable_entries):

        username = self.user
        business_name = fname.replace(".org", "").replace("id-", "")

        def log_unknown_issue(clocktable_entry):
            logger.debug("Unknown issue: %s" % clocktable_entry['issue'])
            self.status['unknown_redmine_entries'].append("%s,%s,%s,%s,%s" % (self.user, 
                                                                              clocktable_entry['started'].strftime("%Y-%m-%d"), 
                                                                              clocktable_entry['ended'].strftime("%Y-%m-%d"), 
                                                                              float((clocktable_entry['ended']-clocktable_entry['started']).seconds)/(60*60),
                                                                              clocktable_entry['issue']))

        

        if redmine_mapping(username, business_name)['db'] is None:
            logger.warning("Skipping %s %s" % (username, business_name))
            return

        for clocktable_entry in clocktable_entries:

            issue_id = self.get_issue_id(clocktable_entry)
            if issue_id is not None:
                try:
                    time_entry = RedmineTimeEntry.create(business=business_name, issue_id=issue_id, username=username, 
                                                         start_time=clocktable_entry['started'],
                                                         end_time=clocktable_entry['ended'])
                except RedmineIssue.DoesNotExist:
                    logger.debug("Unknown issue number: %s" % issue_id)
                    log_unknown_issue(clocktable_entry)
                else:
                    self.status['num_redmine_entries_created'] += 1
                    logger.debug("Created new redmine time entry id=%d: %s %s %s" % (time_entry.id, business_name, clocktable_entry['started'], 
                                                                                     clocktable_entry['ended']))
            else:
                 log_unknown_issue(clocktable_entry)

    def get_issue_id(self, clocktable_entry):
        raw_issue = clocktable_entry['issue']
        issue_id = None
        for regex in [ "issue([^ ])+", "issue *#([^ ]+)" ]:
            match_object = re.compile(regex).search(raw_issue)
            if match_object and match_object.groups() != 0:
                try:
                    issue_id = int(match_object.group(1))
                except Exception:
                    pass

        return issue_id

if __name__== "__main__":
    
    user=sys.argv[1]
    user_email=sys.argv[2]
    Processor(user, user_email).process()
