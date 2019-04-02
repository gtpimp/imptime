import os
import fnmatch
from dateutil.relativedelta import relativedelta
from django.db.models import Q, Avg, Sum, Max, Min, F
import git
from implicitdesign import settings
from timepiece.interface_plugin import get_interface_plugin
from django.utils import timezone
from orgnode import makelist_from_file, makelist_from_string
from django.db import transaction
from datetime import datetime
from django.contrib.auth.models import User
from timepiece.models import Business, Project, Activity, Entry, Location, Attribute, CalendarEvent
from timepiece.models import Issue, IssueStatus, ProjectIssueOrder, IssueComment, IssuePoints
from imptime.bulk_text_parser import BulkTextParser
from timepiece.models import BusinessPermissions
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

    def get_project_timings_for_user(self, business, timesheet_user):
        return float(Entry.objects.filter(issue__project__business=business, user=timesheet_user).aggregate(total_hours=Sum('hours'))['total_hours'] or 0)

    def extract_for_filecontent(self, filename, file_content):
        self._process_org_string(file_content, filename)
        return self.status
    
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
            self.status['infos'].append("Ignoring, Not a timesheet file: %s" % filename)
            logger.debug("Ignoring, Not a timesheet file: %s" % filename)
            return
        business_name = filename.replace(".org", "").replace("id-", "")

        try:
            business = Business.objects.get(name=business_name)
        except:
            business = None

        if business is None:
            try:
                business = Business.objects.get(name__icontains=business_name.lower())
            except:
                business = None

        timesheet_user = User.objects.get(username=self.username)
        self.timings_before = self.get_project_timings_for_user(business=business, timesheet_user=timesheet_user)

        
        self.oldest_clockable_day = Entry.get_oldest_day_for_allowed_clocking(user=timesheet_user)
        bp = BusinessPermissions.for_user(user=timesheet_user,
                                              business=business,
                                              auto_create=False)

        if bp is None:
            raise Exception("User %s doesn't have permission to project for filename %s" % (self.username, filename))
            
        
        if bp.has_edit_old_clock_entries:
            self.oldest_clockable_day = timezone.now()-relativedelta(months=12)
        
        self.status['infos'].append("Oldest clockable day is %s" % self.oldest_clockable_day)
        
        live_entries = Entry.objects.all().filter(user=timesheet_user,
                                                  issue__project__business=business,
                                                  issue__project__status3__is_closed=False,
                                                  end_time__gte=self.oldest_clockable_day,
                                                  source='emacs')
        live_entries.delete()
        
        sprint_name = None

        issues_processed = set()
        section_name = None
        for orgnode in orgnodes:
            if orgnode.Level() == 1:
                section_name = orgnode.Heading().lower().strip()

            if section_name is None:
                raise Exception("Invalid timesheet for %s, missing a one star section in %s" % (self.username, filename))
            if section_name != "development":
                continue

            if orgnode.Level() == 2:
                sprint_name = orgnode.Heading()

            if orgnode.Level() == 3 and sprint_name is not None:

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

        self.timings_after = self.get_project_timings_for_user(business=business, timesheet_user=timesheet_user)
        logger.info("Added %s hours of time for %s" % ((self.timings_after - self.timings_before), self.username))


    def _process_orgnode(self, business, sprint_name, orgnode, issues_processed):
        activity = Activity.objects.get_or_create(code='dev')[0]
        try:
            timesheet_user = User.objects.get(username=self.username)
        except User.DoesNotExist:
            timesheet_user = User.objects.create(username=self.username, first_name=self.username)
        location = Location.objects.get_or_create(name='office')[0]

        try:
            project = Project.get_project_from_name(name=sprint_name, business=business)
        except Project.DoesNotExist:
            raise Exception("No sprint found for [%s] in project %s" % (sprint_name, business.name)) #sic, sprints are called projects

        if not project.can_add_dev_time():
            self.status['infos'].append("Ignoring time for sprint %s in project %s, the sprint is probably closed" % (sprint_name, business.name)) #sic
            return

        issue_id = Issue.extract_issue_id(orgnode.headline)
        issue = None

        has_at_least_one_valid_clock_entry = False
        for clock in orgnode.getClocks():
            if clock['to'].date() >= self.oldest_clockable_day.date():
                has_at_least_one_valid_clock_entry = True
                break

        if not has_at_least_one_valid_clock_entry:
            self.status['infos'].append("No clock entries for '%s' are after the oldest clockable day, ignoring" % orgnode.headline)
            return
            
        if issue_id is not None:
            try:
                # this filter allows that issues could be in the wrong sprint, but they must be in the right business
                issue = Issue.objects.get(number=issue_id, project__business=project.business)
            except Issue.DoesNotExist:
                issue = None
            except Issue.MultipleObjectsReturned:
                issue = Issue.objects.filter(number=issue_id, project__business=project.business).order_by("-interface_plugin_number", "-id")[0]

        if issue and not issue.project.can_add_dev_time():
            self.status['infos'].append(("Issue %s has been moved to sprint %s (id=%s), but it's still in sprint %s (id=%s) in your timesheet. " +\
                                        "Because sprint %s has been closed this time has been ignored, please update your timesheet if this is wrong") %
                                         (issue.number, issue.project.name, issue.project.id, project.name, project.id, issue.project.id))
            return
                
        subject = self._unpack_subject(orgnode.Heading(), project.business)

        description = (orgnode.CleanBody() or "").strip()
        bulk_text_parser = BulkTextParser(timesheet_user)
        meta_info = bulk_text_parser.parse_meta_info(description)
        description = meta_info['description']

        issue_is_new = False
        if issue_id is None or issue is None:
            # Auto create the issue
            try:
                issue, issue_is_new = Issue.objects.get_or_create(project=project,
                                                                  subject=subject,
                                                                  defaults={'auto_created_during_import':True,
                                                                            'issue_type':meta_info['attributes'].get('type', 'adhoc'),
                                                                            'status2':IssueStatus.objects.get_or_create(name=meta_info['attributes'].get('status','dev done'),
                                                                                                                        business=business)[0],
                                                                            'assigned_to':timesheet_user,
                                                                            'number':Issue.get_next_issue_number(project.business),
                                                                            'description':description,
                                                                            'story_points':0})
                ProjectIssueOrder.insert_at_the_end(issue)
                if issue_is_new:
                    self.status['num_issues_created'] += 1
            except Issue.MultipleObjectsReturned:
                issue = Issue.objects.filter(project=project, subject=subject).first()

        estimate = meta_info['attributes'].get('estimate', None)
        if estimate:
            estimate = float(estimate)
            IssuePoints.objects.get_or_create(user=timesheet_user,
                                              issue=issue,
                                              defaults={'points':estimate})
                
        # Insert the clock entries
        for clock in orgnode.getClocks():

            if clock['from'].day != clock['to'].day:
                self.status['errors'].append("Clock entry spans more than one day, if this is real then split the entry. From=%s, To=%s. Issue=%s:%s" % (clock['from'], clock['to'], issue.number, subject))
                continue

            if clock['to'].date() < self.oldest_clockable_day.date():
                self.status['infos'].append("Ignoring clock entry %s - %s in issue %s because it's before %s" %
                                            (clock['from'], clock['to'], orgnode.headline, self.oldest_clockable_day))
                continue
            
            timesheet_comment_text = orgnode.CleanBody().strip()
            Entry.objects.create(user=timesheet_user,
                                 source='emacs',
                                 start_time=clock['from'], end_time=clock['to'],
                                 activity=activity,
                                 location=location,
                                 issue=issue,
                                 status='approved',
                                 comments=orgnode.Heading())

            self.status['infos'].append("Set clock entry: issue:{issue_number} sprint:{sprint_name} project:{project_name} start:{start_time} end:{end_time}"\
                                        .format(issue_number=issue.number,
                                                sprint_name=sprint_name,
                                                project_name=business.name,
                                                start_time=clock['from'],
                                                end_time=clock['to']))

            if issue is not None:
                if issue.assigned_to is None:
                    issue.assigned_to = timesheet_user
                    issue.save()
                
                issues_processed.add(issue)

                if not issue_is_new and len(timesheet_comment_text) > 0:
                    timesheet_comment = IssueComment.objects.get_or_create(issue=issue,
                                                                           comment_type='timesheet',
                                                                           author=timesheet_user)[0]
                    if timesheet_comment.comment != timesheet_comment_text:
                        timesheet_comment.comment = timesheet_comment_text
                        timesheet_comment.save()
                

            self.status['num_entries_refreshed'] += 1

    def _unpack_subject(self, raw_subject, business):
        return raw_subject
