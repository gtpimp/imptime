import urllib
import datetime
import time
import calendar
from decimal import Decimal

from django import template
from django.db.models import Sum
from django.core.urlresolvers import reverse

try:
    from django.utils import timezone
except ImportError:
    from timepiece import timezone

from dateutil.relativedelta import relativedelta
from dateutil import rrule

import timepiece.models as timepiece
from timepiece.utils import get_total_time, get_week_start, get_month_start


register = template.Library()

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
    return HasPermissionNode(nodelist, perm_name )

def do_has_not_permission(parser, token):
    nodelist = parser.parse(('end_permission',))
    parser.delete_first_token()
    tag_name, perm_name, business = token.contents.split(None)
    return HasPermissionNode(nodelist, perm_name, opposite=True)

register.tag('has_permission', do_has_permission)
register.tag('has_not_permission', do_has_not_permission)

class HasPermissionNode(template.Node):
    def __init__(self, nodelist, perm_name, opposite=False):
        self.nodelist = nodelist
        self.perm_name = perm_name
        self.opposite = opposite
        
    def render(self,context):

        if 'business_permissions_by_user' not in context:
            raise Exception("Invalid context, requires property business_permissions_by_user")

        has = False
        if context['current_user'].is_superuser:
            has = True
        else:
            bp = context['business_permissions_by_user'][context['current_user'].id]
            has_permission = getattr(bp, self.perm_name)
            if has_permission:
                has = True

        if self.opposite:
            has = not has
        if has:
            return self.nodelist.render(context)
        else:
            return ""

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
    
@register.simple_tag(takes_context=True)
def get_points_current_user(context, issue_id):
    user = context['current_user']
    issue = timepiece.Issue.objects.get(pk=issue_id)
    try:
        issue_points = timepiece.IssuePoints.objects.get(user=user,issue = issue)
    except timepiece.IssuePoints.DoesNotExist:
        issue_points = None
    return issue_points.points if issue_points else None

@register.simple_tag(takes_context=True)
def get_points_current_user_id(context, issue_id):
    user = context['current_user']
    issue = timepiece.Issue.objects.get(pk=issue_id)
    try:
        issue_points = timepiece.IssuePoints.objects.get(user=user,issue = issue)
    except timepiece.IssuePoints.DoesNotExist:
        issue_points = None
    return issue_points.id if issue_points else None
    
        
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
        error = 'Somehow you\'ve logged %s negative hours for %s this week.' \
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
