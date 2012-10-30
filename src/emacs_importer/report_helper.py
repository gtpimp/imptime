from timepiece import models as timepiece
import re
import StringIO
import csv

def incremental_timesheets_by_project(project):

    headings = [ 'business', 'project', 'sprint', 'type', 'issue nr', 'cat1', 'cat2', 'redmine description',
                 'full issue description', 'story points', 'cost est', 'bill est', 'story status', 'time log category', 
                 'username', 'date', 'hours', 'time log description', 'cost', 'bill' ]
    rows = [headings,]

    entries = timepiece.Entry.objects.filter(project=project).order_by("user", "start_time")
    for entry in entries:
        try:
            rate = timepiece.Rate.objects.get(project=project, user=entry.user)
            rate_amount = rate.amount
        except timepiece.Rate.DoesNotExist:
            rate_amount = 0
        row_dict = {
            'business': project.business.name,
            'project': project.business.name,
            'sprint': project.name,
            'type': 'Time log',
            'issue nr': _get_issue_number(entry),
            'cat1': None,
            'cat2': None,
            'redmine description': None,
            'full issue description': None,
            'story points': None,
            'cost est': None,
            'bill est': None,
            'story status': None,
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

    