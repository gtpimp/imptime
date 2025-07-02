import urllib
import datetime
import time
from timepiece import timings
import calendar
from decimal import Decimal
import markdown

from django import template
from django.db.models import Sum
from django.urls import reverse
import re

try:
    from django.utils import timezone
except ImportError:
    from timepiece import timezone

from dateutil.relativedelta import relativedelta
from dateutil import rrule
from django.utils.safestring import mark_safe

import timepiece.models as timepiece
from timepiece.utils import get_total_time, get_week_start, get_month_start, percentage


register = template.Library()

percentage = register.filter(percentage)

@register.filter
def currency(value):
    if value:
        try:
            return "R %.2f" % float(value)
        except (TypeError, ValueError):
            return u''
    else:
        return u''

@register.filter
def seconds_to_hours(seconds):
    return round(seconds / 3600.0, 2)

@register.filter
def seconds_to_hours(seconds):
    return round(seconds / 3600.0, 2)

@register.filter
def epoch(value):
    try:
        return int(calendar.timegm(value.timetuple()) * 1000)
        #return int(time.mktime(value.timetuple())*1000)
    except AttributeError:
        return ''

@register.simple_tag(takes_context=True)
def prepare_project_stats(context, logged_in_user, project):
    project.calculate_new_stats(logged_in_user)
    return ""

@register.simple_tag(takes_context=True)
def clock_entries_for_user(context, user, issue):
    context['entries'] = issue.entries.all().filter(user=user).order_by("start_time")
    return ""

@register.simple_tag(takes_context=True)
def current_user_issue_cost(context, issue_points):
    try:
        rate = context['current_user_rate']
    except:
        rate = 0

    return rate*(issue_points or 0)

def do_has_permission(parser, token):
    nodelist = parser.parse(('end_permission',))
    parser.delete_first_token()
    tag_name, perm_name, business = token.contents.split(None)
    return HasPermissionNode(nodelist, perm_name, business )

def do_has_not_permission(parser, token):
    nodelist = parser.parse(('end_permission',))
    parser.delete_first_token()
    tag_name, perm_name, business = token.contents.split(None)
    return HasPermissionNode(nodelist, perm_name, business, opposite=True)

register.tag('has_permission', do_has_permission)
register.tag('has_not_permission', do_has_not_permission)

class HasPermissionNode(template.Node):
    def __init__(self, nodelist, perm_name, business, opposite=False):
        self.nodelist = nodelist
        self.perm_name = perm_name
        self.opposite = opposite
        self.business = template.Variable(business)

    def render(self,context):

        business = self.business.resolve(context)
        if 'business_permissions_by_user' not in context:
            business_permissions_by_user = timepiece.BusinessPermissions.by_user(business)
        else:
            business_permissions_by_user = context['business_permissions_by_user']
            context['business_permissions_by_user'] = business_permissions_by_user

        has = False

        logged_in_user = context['user']
        if logged_in_user.is_superuser or logged_in_user.has_perm('timepiece.belongs_to_all_projects'):
            has = True
        else:
            try:
                bp = business_permissions_by_user[logged_in_user.id]
            except KeyError:
                has = False
            else:
                has_permission = getattr(bp, self.perm_name)
                if has_permission:
                    has = True

        if self.opposite:
            has = not has
        if has:
            res = self.nodelist.render(context)
        else:
            res = ""
        return res

def user_can_estimate_own_points(parser, token):
    nodelist = parser.parse(('end_can_estimate',))
    parser.delete_first_token()
    tag_name, user, business = token.contents.split(None)
    user = parser.compile_filter(user)
    return CanEstimateOwnPointsNode(nodelist, user )

class CanEstimateOwnPointsNode(template.Node):
    def __init__(self, nodelist, user):
        self.nodelist = nodelist
        self.user = user

    def render(self,context):
        if 'business_permissions_by_user' not in context:
            raise Exception("Invalid context, requires property business_permissions_by_user")
        output = self.nodelist.render(context)
        resolved_user = self.user.resolve(context,True)

        if resolved_user.is_superuser:
            return output

        if context['business_permissions_by_user'][resolved_user.id].can_estimate_own_points:
            return output
        return ""
register.tag('user_can_estimate_own_points', user_can_estimate_own_points)

def is_same_user(parser, token):
    nodelist = parser.parse(('end_is_same_user',))
    parser.delete_first_token()
    tag_name, user1, user2 = token.contents.split(None)
    user1 = parser.compile_filter(user1)
    user2 = parser.compile_filter(user2)
    return IsSameUser(nodelist, user1, user2 )

class IsSameUser(template.Node):
    def __init__(self, nodelist, user1, user2):
        self.nodelist = nodelist
        self.user1 = user1
        self.user2 = user2

    def render(self,context):
        output = self.nodelist.render(context)
        resolved_user1 = self.user1.resolve(context,True)
        resolved_user2 = self.user2.resolve(context,True)
        if resolved_user1.id == resolved_user2.id:
            return output
        return ""
register.tag('is_same_user', is_same_user)

@register.filter
def asmarkdown(content):
    if content is None:
        return ""
    return markdown.markdown(content)

@register.filter
def with_issue_links(content):
    return re.sub("issue(\d+)", r"<a href='#' onclick='imp.search_on_issue_number(\1)'>issue\1</a>", content)

@register.simple_tag(takes_context=True)
def get_points_current_user(context, issue_id):
    user = context['current_user']
    try:
        return timepiece.IssuePoints.filter(user=user, issue_id=issue_id).values('points')[0]['points']
    except IndexError:
        return None
    # issue = timepiece.Issue.objects.get(pk=issue_id)
    # try:
    #     issue_points = timepiece.IssuePoints.objects.get(user=user,issue = issue)
    # except timepiece.IssuePoints.DoesNotExist:
    #     issue_points = None
    # return issue_points.points if issue_points else None

@register.simple_tag(takes_context=True)
def get_points_current_user_id(context, issue_id):
    user = context['current_user']
    issue = timepiece.Issue.objects.get(pk=issue_id)
    try:
        issue_points = timepiece.IssuePoints.objects.get(user=user,issue = issue)
    except timepiece.IssuePoints.DoesNotExist:
        issue_points = None
    return issue_points.id if issue_points else None

@register.simple_tag(takes_context=True)
def get_hours_for_issue(context, user, issue):
    hours = issue.hours_for_user(user)
    if not hours:
        return ""
    return "%.1f" % float(hours)

@register.simple_tag(takes_context=True)
def get_unassigned_hours_for_project(context, user, project):
    hours = project.total_unassigned_hours_for_user(user)
    if not hours:
        return ""
    return "%.1f" % float(hours)

@register.simple_tag(takes_context=True)
def get_all_hours_for_project(context, user, project):
    hours = project.total_hours_for_user(user)
    if not hours:
        return ""
    return "%.1f" % float(hours)

@register.simple_tag(takes_context=True)
def get_all_points_for_project(context, user, project):
    hours = project.total_points_for_user(user)
    if not hours:
        return ""
    return "%.1f" % float(hours)

@register.simple_tag(takes_context=True)
def get_all_devdone_points_for_project(context, user, project):
    hours = project.total_points_for_user(user, issue_status='devdone')
    if not hours:
        return ""
    return "%.1f" % float(hours)

@register.inclusion_tag('timepiece/traffic_bar.html')
def budget_traffic_bar(project):
    if project.stats['amount_under_budget'] > 0:
        text = "R{:10.2f} under budget".format(project.stats['amount_under_budget'])
    else:
        text = "R{:10.2f} over budget".format(project.stats['amount_over_budget'])
    return traffic_bar(project.stats['percentage_spent'], text)

@register.inclusion_tag('timepiece/traffic_bar.html')
def traffic_bar_ratio(amount_done, amount_todo):
    if amount_done == 0:
        text = "/ R{:10.0f}".format(amount_todo)
        percentage = 0
    else:
        text = "R{:10.0f} / R{:10.0f}".format(amount_done, amount_todo)
        percentage = float(amount_todo) / amount_done
    return traffic_bar( percentage, text)

@register.inclusion_tag('timepiece/traffic_bar.html')
def traffic_bar(percentage, text, tooltips=None, colour=None ):
    """ tooltips is a list of tuples which get displayed in a table """
    if colour is None:
        if percentage >= 100:
            colour = "traffic_red"
        else:
            colour = "traffic_green"

    return { 'width_percent': percentage,
             'message': text,
             'colour': colour,
             'tooltips': tooltips }

@register.simple_tag(takes_context=True)
def calculate_role_data(context, user, project):

    project.calculate_new_stats(user)
    role_data = project.new_stats['per_role']

    for role_name, data in role_data.items():
        data['budget'] = project.estimated_budget_for_role(role_name)
        data['budget_without_scope_creep'] = project.estimated_budget_for_role(role_name, include_scope_creep=False)

    context['role_data'] = { 'per_role' : role_data,
                             'commission' : {
                                 'budget': project.estimated_budget_for_role("commission")
                                 }
                             }
    return ""

@register.filter
def cost_for_mode(role_data, mode):
    """ role_data comes from calculate_role_data, so it must have already been called with the correct project """
    cost = role_data['per_role'][mode]['hours_billable_core_rate']
    return cost

# The first argument *must* be called "context" here.
@register.inclusion_tag('timepiece/traffic_bar.html', takes_context=True)
def running_progress_for_user_in_sprint(context, user, project):

    try:
        #actual = project.new_stats['per_user'][user]['hours_closed_normal'] or None
        actual = project.new_stats['per_user'][user]['hours'] or None
        total = project.new_stats['per_user'][user]['points_closed_non_management'] or 0
    except KeyError:
        actual = None
        total = 0
    data = _create_traffic_data(actual, total)

    if not project.new_stats['per_user'].get(user):
        data['message'] = 'V = 0'
        data['tooltips'] = [ ["Total hours", "0"],
                             ["Total issue hours", "0", "(estimated 0 hours)"],
                             ["Closed issue hours","0", "(estimated 0 hours)"],
                             ["Estimated remaining hours", "0"],
                             ["--"],
                             ["Total adhoc hours", "0"],
                             ["--"],
                             ["Estimated velocity", "0"],
                             ["Actual velocity", "0"] ]
    else:
        data['message'] = 'V = %.2f' % project.new_stats['per_user'][user]['calculated_velocity']

        data['tooltips'] = [ ["Role", project.role_for_user(user)],
                             ["Total hours", "%.2f" % (project.new_stats['per_user'][user]['hours'] or 0)],
                             ["Total role appropriate hours", "%.2f" % (project.new_stats['per_user'][user]['hours_for_role'] or 0)],
                             ["Total other hours", "%.2f" % ((float(project.new_stats['per_user'][user]['hours'] or 0)) - (float(project.new_stats['per_user'][user]['hours_for_role'] or 0)))],
                             ["Total non-adhoc hours", "%.2f"%(project.new_stats['per_user'][user]['hours_real'] or 0), "(estimated %.2f hours)"%(project.new_stats['per_user'][user]['points_non_management'] or 0)],
                             ["Total adhoc hours", "%.2f" % (project.new_stats['per_user'][user]['hours_adhoc'] or 0)],
                             ["Closed issue hours","%.2f"%(project.new_stats['per_user'][user]['hours_closed'] or 0), "(estimated %.2f hours)"%(project.new_stats['per_user'][user]['points_closed_non_management'] or 0)],
                             ["Estimated remaining hours", "%.2f" % (project.new_stats['per_user'][user]['points_open_non_management'] or 0)],
                             ["--"],
                             ["--"],
                             ["Estimated velocity", "%.2f" % (project.new_stats['per_user'][user]['rate'].velocity or 0)],
                             ["Actual velocity", "%.2f" % (project.new_stats['per_user'][user]['calculated_velocity'] or 0)] ]

    return data

def _create_traffic_data(actual, total):

    if total is None or actual is None:
        return {'actual':'',
                'total':'',
                'width_percent':0,
                'colour':'',
                'message':''}

    if total == 0:
        total = actual
        valid_total = False
    else:
        valid_total = True

    actual_original = actual
    if float(actual)/float(total) > 1.2:
        colour = "traffic_red"
    elif float(actual)/float(total) > 1:
        colour = "traffic_yellow"
    else:
        colour = "traffic_green"
    if actual > total:
        actual = total

    return {'actual':actual if valid_total else 0,
            'total':total,
            'width_percent':100.0 * float(actual)/float(total) if valid_total else 0,
            'colour':colour,
            'message': ("%.1f / %.1f" % (actual_original, total)) if valid_total else actual_original}

@register.inclusion_tag('timepiece/time-sheet/bar_graph.html',
                        takes_context=True)
def bar_graph(context, name, worked, total, width=None, suffix=None):
    if not width:
        width = 400
        suffix = 'px'
    left = total - worked
    over = 0
    over_total = 0
    error = ''
    if worked < 0:
        error = "Somehow you've logged %s negative hours for %s this week." \
        % (abs(worked), name)
    if left < 0:
        over = abs(left)
        left = 0
        total = over + total
    return {
        'name': name, 'worked': worked,
        'total': total, 'left': left,
        'over': over, 'width': width,
        'suffix': suffix, 'error': error,
        }


@register.inclusion_tag('timepiece/time-sheet/_date_filters.html',
    takes_context=True)
def date_filters(context, options=None):
    request = context['request']
    from_slug = 'from_date'
    to_slug = 'to_date'
    use_range = True
    if not options:
        options = ('months', 'quarters', 'years')

    def construct_url(from_date, to_date):
        query = request.GET.copy()
        query.pop(to_slug, None)
        query.pop(from_slug, None)
        query[to_slug] = to_date.strftime('%m/%d/%Y')
        if use_range:
            query[from_slug] = from_date.strftime('%m/%d/%Y')
        return '%s?%s' % (request.path, query.urlencode())

    filters = {}
    if 'months_no_range' in options:
        filters['Past 12 Months'] = []
        single_month = relativedelta(months=1)
        from_date = datetime.date.today().replace(day=1) + \
            relativedelta(months=1)
        for x in range(12):
            to_date = from_date
            use_range = False
            from_date = to_date - single_month
            url = construct_url(from_date, to_date - relativedelta(days=1))
            filters['Past 12 Months'].append(
                (from_date.strftime("%b '%y"), url))
        filters['Past 12 Months'].reverse()

    if 'months' in options:
        filters['Past 12 Months'] = []
        single_month = relativedelta(months=1)
        from_date = datetime.date.today().replace(day=1) + \
            relativedelta(months=1)
        for x in range(12):
            to_date = from_date
            from_date = to_date - single_month
            url = construct_url(from_date, to_date - relativedelta(days=1))
            filters['Past 12 Months'].append(
                (from_date.strftime("%b '%y"), url))
        filters['Past 12 Months'].reverse()

    if 'years' in options:
        start = datetime.date.today().year - 3

        filters['Years'] = []
        for year in range(start, start + 4):
            from_date = datetime.datetime(year, 1, 1)
            to_date = from_date + relativedelta(years=1)
            url = construct_url(from_date, to_date - relativedelta(days=1))
            filters['Years'].append((str(from_date.year), url))

    if 'quarters' in options:
        filters['Quarters (Calendar Year)'] = []
        to_date = datetime.date(datetime.date.today().year - 1, 1, 1)
        for x in range(8):
            from_date = to_date
            to_date = from_date + relativedelta(months=3)
            url = construct_url(from_date, to_date - relativedelta(days=1))
            filters['Quarters (Calendar Year)'].append(
                ('Q%s %s' % ((x % 4) + 1, from_date.year), url)
            )

    return {'filters': filters}


@register.inclusion_tag('timepiece/time-sheet/invoice/_invoice_subheader.html',
                        takes_context=True)
def invoice_subheaders(context, current):
    return {
        'current': current,
        'invoice': context['invoice'],
    }

@register.simple_tag
def hours_for_assignment(assignment, date):
    end = date + relativedelta(days=5)
    blocks = assignment.blocks.filter(
        date__gte=date, date__lte=end).select_related()
    hours = blocks.aggregate(hours=Sum('hours'))['hours']
    if not hours:
        hours = ''
    return hours


@register.simple_tag
def total_allocated(assignment):
    hours = assignment.blocks.aggregate(hours=Sum('hours'))['hours']
    if not hours:
        hours = ''
    return hours


@register.simple_tag
def hours_for_week(user, date):
    end = date + relativedelta(days=5)
    blocks = timepiece.AssignmentAllocation.objects.filter(
                                                 assignment__user=user,
                                                 date__gte=date, date__lte=end)
    hours = blocks.aggregate(hours=Sum('hours'))['hours']
    if not hours:
        hours = ''
    return hours


@register.simple_tag
def weekly_hours_worked(rp, date):
    hours = rp.hours_in_week(date)
    if not hours:
        hours = ''
    return hours


@register.simple_tag
def monthly_overtime(rp, date):
    hours = rp.total_monthly_overtime(date)
    if not hours:
        hours = ''
    return hours


@register.simple_tag
def week_start(date):
    return get_week_start(date).strftime('%m/%d/%Y')


@register.simple_tag
def get_active_hours(entry):
    """Use with active entries to obtain time worked so far"""
    if not entry.end_time:
        if entry.is_paused:
            entry.end_time = entry.pause_time
        else:
            entry.end_time = timezone.now()
    return Decimal('%.2f' % round(entry.total_hours, 2))


@register.simple_tag
def show_cal(from_date, offset=0):
    date = get_month_start(from_date)
    date = date + relativedelta(months=offset)
    html_cal = calendar.HTMLCalendar(calendar.SUNDAY)
    return html_cal.formatmonth(date.year, date.month)


@register.simple_tag
def get_uninvoiced_hours(entries):
    hours_uninvoiced = 0
    for entry in entries:
        if entry['status'] != 'invoiced' and entry['status'] != 'not-invoiced':
            hours_uninvoiced += entry['s']
    return hours_uninvoiced


@register.filter
def work_days(end):
    weekdays = (rrule.MO, rrule.TU, rrule.WE, rrule.TH, rrule.FR)
    days = rrule.rrule(rrule.DAILY, byweekday=weekdays,
                       dtstart=datetime.date.today(), until=end)
    return len(list(days))


@register.simple_tag
def timesheet_url(type, pk, date):
    if type == 'project':
        name = 'project_time_sheet'
    elif type == 'user':
        name = 'view_person_time_sheet'

    url = reverse(name, args=(pk,))
    params = {
        'month': date.month,
        'year': date.year
    }

    return '?'.join((url, urllib.urlencode(params),))

@register.filter
def keyvalue(dict, key):
    return dict[key]

@register.simple_tag(takes_context=False)
def timing_start(name):
    timings.start(name)
    return ""

@register.simple_tag(takes_context=False)
def timing_end(name):
    timings.end(name)
    return ""

@register.filter(is_safe=True)
def points_and_stuff(per_user):

    if not per_user:
        return mark_safe('&nbsp;')
    points = per_user['issue_points']
    points = points if points else '&nbsp;'
    points = '<span class="estimated_hours">%s</span>' % points

    if per_user['has_estimate'] and per_user['has_hours']:
        if per_user['has_hours']:
            return mark_safe(u'%s / %s' % (per_user['hours'], points))
        else:
            return mark_safe(u' / %s' % points)
    elif per_user['has_hours']:
        return mark_safe(u'%s / ' % per_user['hours'])
    elif per_user['has_estimate']:
        return mark_safe(u' / %s' % points)
    else:
        return mark_safe('&nbsp;')

@register.simple_tag(takes_context = True)
def cookie(context, cookie_name, default_value=''):
    request = context['request']
    result = request.COOKIES.get(cookie_name, default_value)
    return result
