from timepiece import models as timepiece
import re
from io import StringIO
import csv
from .models import redmine_mapping, RedmineIssue

def incremental_timesheets_by_project(project):

    headings = [ 'business', 'project', 'sprint', 'type', 'issue nr', 'cat1', 'cat2', 'redmine description',
                 'full issue description', 'story points', 'cost est', 'bill est', 'story status', 'time log category', 
                 'username', 'date', 'hours', 'time log description', 'cost', 'bill' ]
    rows = [headings,]

    entries = timepiece.Entry.objects.filter(project=project).order_by("user", "comments")
    for entry in entries:
        issue_number = _get_issue_number(entry)
        try:
            rate = timepiece.Rate.objects.get(project=project, user=entry.user)
            rate_amount = float(rate.amount)
        except timepiece.Rate.DoesNotExist:
            rate_amount = 0
        redmine_issue = _get_redmine_issue(entry, issue_number)
        row_dict = {
            'business': project.business.name,
            'project': project.business.name,
            'sprint': project.name,
            'type': 'Time log',
            'issue nr': issue_number,
            'cat1': redmine_issue.get_custom_value('Cat1') or "" if redmine_issue is not None else "",
            'cat2': redmine_issue.get_custom_value('Cat2') or "" if redmine_issue is not None else "",
            'redmine description': redmine_issue.subject if redmine_issue is not None else "",
            'full issue description': None,
            'story points': redmine_issue.story_points or 0 if redmine_issue is not None else 0,
            'cost est': (redmine_issue.story_points or 0 if redmine_issue is not None else 0) * rate_amount,
            'bill est': None,
            'story status': redmine_issue.status.name if redmine_issue is not None else "",
            'time log category': _get_issue_category(entry),
            'username': entry.user.username,
            'date': entry.start_time.strftime("%Y-%m-%d"),
            'hours': entry.hours,
            'time log description': entry.comments,
            'cost': rate_amount,
            'bill': None
        }
        rows.append( tuple(row_dict[heading] for heading in headings) )

    return rows

def convert_report_to_csv(report):
    s = StringIO.StringIO()
    c = csv.writer(s)
    for row in report:
        c.writerow( [x.encode("UTF8") if type(x)==unicode else x for x in row] )
    return s.getvalue()

issue_nr_regexes = [ re.compile("[iI]ssue(\d+)"), re.compile("[iI]ssue *#(\d+)"), re.compile("[iI]ssue (\d+)") ]
def _get_issue_number(entry):
    raw_issue = entry.comments
    issue_number = None
    for regex in issue_nr_regexes:
        match_object = regex.search(raw_issue)
        if match_object and match_object.groups() != 0:
            try:
                issue_number = int(match_object.group(1))
            except Exception:
                pass
    return issue_number

issue_category_regex = re.compile('\(([^)]*)\)')
def _get_issue_category(entry):
    raw_issue = entry.comments
    match_object = issue_category_regex.search(raw_issue)
    issue_category = ""
    if match_object and match_object.groups() != 0:
        issue_category = match_object.group(1)
    return issue_category

def _get_redmine_issue(entry, issue_number):
    if issue_number is None:
        return None
    business = entry.project.business.name
    username = entry.user.username
    mapping = redmine_mapping(username, business)
    db = mapping['db']
    try:
        return RedmineIssue.get_for_issue_id(db, issue_number)
    except RedmineIssue.DoesNotExist:
        return None
