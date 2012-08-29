import sys
import os
import settings
import json
import copy
import calendar
from django.contrib.auth.models import User
from timepiece.models import Business, Project, Activity, Entry, Location, Attribute
from datetime import *
from dateutil.relativedelta import relativedelta
import calendar
import csv
import subprocess
import smtplib
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
    email_to = ["gtp@implicitdesign.co.za", "laila@implicitdesign.co.za"]
    
    def __init__(self, user="test", user_email="fake@implicitdesign.co.za", 
                 root_folder = '.', email_from='gtp@implicitdesign.co.za', 
                 num_historical_days=60, 
                 pointperson_username='test',
                 rates_info = {'test':{}},
                 ref_current_date = None):
        self.user = user
        self.user_email = user_email
        self.root_folder = root_folder
        self.input_path = os.path.join(self.root_folder, "input", self.user)
        self.num_historical_days = num_historical_days
        self.pointperson_username = pointperson_username
        self.ref_current_date = ref_current_date or datetime.today()

        if not os.path.exists(self.input_path):
            logger.error(Exception("No user input file at %s " % self.input_path))

        self.output_path = settings.EMACSIMPORTER_TEMP_DIR
        self.temp_filename = os.path.join(self.output_path, "temp.org")
        self.load_rates(rates_info)

    def load_rates(self, rates_info):
        self.user_rates = rates_info[self.user]

    def process(self):

        self.output_files = []
        self.summary_files = []
        self.historical_summary_files = []
        self.historical_dates = []
        self.crossfile_clocktables = {}

        self.update_input_folder()
        
        def callback(arg, dirname, fnames):
            for fname in fnames:
                
                only_include_rated_files = True
                
                is_valid_timesheet_file = fname[-4:] == ".org" and fname[0] != "." and fname[0] != "#" and \
                    ( not only_include_rated_files or fname in self.user_rates.keys())
                
                if is_valid_timesheet_file:
                    tstart = self.ref_current_date - timedelta(days=self.num_historical_days) 
                    tend = self.ref_current_date
                    self.process_file(dirname, fname, tstart, tend)
                else:
                    logger.debug("%s: Ignoring : %s" % (self.user,fname))

        logger.debug( "looking for timesheet files in %s" % self.input_path)
        os.path.walk(self.input_path, callback, None)

    def update_input_folder(self):
        if self.user == "test":
            #'test' doesn't have a git repo, and we don't want to reset our code during development
            return

        process_args = [os.path.join(self.root_folder, 'reset_input_folder.sh'), self.input_path]
        p = subprocess.Popen(process_args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        p.wait()

    def process_file(self, dirname, fname, tstart, tend):

        filepath = os.path.join(dirname, fname)

        self.create_clocktable_file(filepath, self.temp_filename, tstart, tend)
        self.create_clocktable(self.temp_filename)
        clocktable_entries = self.extract_clocktable_entries(self.temp_filename)
        self.import_clocktable_entries(fname, clocktable_entries)
        
    def create_clocktable_file(self, input_file, output_file, tstart, tend):
        date_format = "%Y-%m-%d %a"
        clocktable_def = '#+BEGIN: clocktable :maxlevel 3 :scope file :link nil :tstart "<%s>" :tend "<%s>" :step day\n#+END:\n' % (tstart.strftime(date_format), tend.strftime(date_format))
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

    def extract_clocktable_entries(self, input_file):
        f = open(input_file)
        f.readline() 
        clocktable_entries = []

        current_sprint_name = None

        for line in f:
            time_parts = line.split("|")
            if "#+END" not in line and ():
                continue

            if "Daily report" in line:
                start_date = datetime.strptime(line[-16:-6], "%Y-%m-%d")
                start_date = datetime(start_date.year, start_date.month, start_date.day, 1, 0)

            elif "#+END" in line:
                return clocktable_entries
            elif len(time_parts)<2 or time_parts[1].strip() == 'L' or '*Total time*' in line:
                continue
            elif len(time_parts) >= 6:
                description = time_parts[2].strip()
                sprint_time = time_parts[4].strip()
                issue_time = time_parts[5].strip()
                if len(sprint_time)>0:
                    current_sprint_name = description
                elif len(issue_time)>0:
                    hours, minutes = issue_time.split(":")
                    minutes = 60*int(hours) + int(minutes)
                    started = start_date
                    ended = started + timedelta(minutes=minutes)
                    clocktable_entries.append( {'sprint': current_sprint_name,
                                                'issue': description,
                                                'started': started,
                                                'ended': ended } )
            
        raise Exception("Shouldn't get here")


    def import_clocktable_entries(self, fname, clocktable_entries):
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

            try:
                entry = Entry.objects.get(user=timesheet_user, 
                                          activity=activity,location=location,project=project,
                                          start_time__year=clocktable_entry['started'].year,
                                          start_time__month=clocktable_entry['started'].month,
                                          start_time__day=clocktable_entry['started'].day)

                if entry.start_time.replace(tzinfo=None) != clocktable_entry['started'] or entry.end_time.replace(tzinfo=None) != clocktable_entry['ended']:
                    logger.debug("Existing entry: %s %s %s %s : %s" % (business, project, clocktable_entry['started'], clocktable_entry['ended'], entry))
                    logger.info("Timesheet entry changed. Was %s to %s, now %s to %s, updating" % (entry.start_time, entry.end_time, clocktable_entry['started'], clocktable_entry['ended']))
                    entry.start_time = clocktable_entry['started']
                    entry.end_time = clocktable_entry['ended']
                    entry.save()

            except Entry.MultipleObjectsReturned:
                for entry in Entry.objects.filter(user=timesheet_user, 
                                             activity=activity,location=location,project=project,
                                             start_time__year=clocktable_entry['started'].year,
                                             start_time__month=clocktable_entry['started'].month,
                                             start_time__day=clocktable_entry['started'].day):
                    entry.delete()

                entry = Entry.objects.create(user=timesheet_user, 
                                             start_time=clocktable_entry['started'], end_time=clocktable_entry['ended'],
                                             activity=activity,location=location,project=project,
                                             status='approved',
                                             comments='auto_created')
                logger.debug("Created entry: %s %s %s %s : %s" % (business, project, clocktable_entry['started'], 
                                                                  clocktable_entry['ended'], entry))
                    
            except Entry.DoesNotExist:
                entry = Entry.objects.create(user=timesheet_user, 
                                             start_time=clocktable_entry['started'], end_time=clocktable_entry['ended'],
                                             activity=activity,location=location,project=project,
                                             status='approved',
                                             comments='auto_created')
                logger.debug("Created entry: %s %s %s %s : %s" % (business, project, clocktable_entry['started'], 
                                                                  clocktable_entry['ended'], entry))
        

if __name__== "__main__":
    
    user=sys.argv[1]
    user_email=sys.argv[2]
    Processor(user, user_email).process()
