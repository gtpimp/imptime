from django import template
from django.db.models import Q, Avg, Sum, Max, Min, F
register = template.Library()
from timepiece.models import Schedule
from django.contrib.humanize.templatetags.humanize import intcomma

@register.simple_tag(takes_context=True)
def scheduled_time(context, user, business):

    if not context.get('schedules_by_user_and_business', None):
        x = {}
        for schedule in context['schedules'].values():
            user_id = schedule['user_id']
            business_id = schedule['business_id']
            x.setdefault(user_id, {})
            num_hours = schedule['num_hours']

            original_num_hours = num_hours
            # num_days = int(float(num_hours) / 8)
            # num_hours = int(float(num_hours) % 8)
            # if num_hours == 0:
            #     schedule['pretty_num_hours'] = "%dd" % num_days
            # else:
            schedule['pretty_num_hours'] = "%d" % original_num_hours
                
            x[user_id].setdefault(business_id, schedule)
            
        context['schedules_by_user_and_business'] = x

    try:
        return context['schedules_by_user_and_business'][user.id][business.id]['pretty_num_hours']
    except KeyError:
        return ""

@register.simple_tag(takes_context=True)
def actual_time(context, user, business):

    if not context.get('actuals_by_user_and_business', None):
        x = {}
        qs = context['actuals'].order_by("user", "issue__project__business__id").values('user', 'issue__project__business_id').annotate(total_hours=Sum('hours'))
        for actual in qs:
            user_id = actual['user']
            business_id = actual['issue__project__business_id']
            x.setdefault(user_id, {})
            num_hours = actual['total_hours']

            original_num_hours = num_hours
            actual['pretty_num_hours'] = "%d" % original_num_hours
            x[user_id].setdefault(business_id, actual)
        context['actuals_by_user_and_business'] = x
    try:
        actual = context['actuals_by_user_and_business'][user.id][business.id]
        if actual['total_hours']:
            return actual['pretty_num_hours'] + " /"
        else:
            return ""
    except KeyError:
        return ""
    
@register.simple_tag(takes_context=True)    
def scheduled_total_user_time(context, user):
    return "%d" % (context['schedules'].hours_for_user(user.id) or 0)

@register.simple_tag(takes_context=True)    
def actual_total_user_time(context, user):
    hours = "%d" % (context['actuals'].hours_for_user(user.id) or 0)
    if hours:
        return hours + " / "
    else:
        return ""

@register.simple_tag(takes_context=True)    
def scheduled_total_business_time(context, business):
    return "%d" % (context['schedules'].hours_for_business(business.id) or 0)

@register.simple_tag(takes_context=True)    
def actual_total_business_time(context, business):
    return "%d" % (context['actuals'].hours_for_business(business.id) or 0)

@register.simple_tag(takes_context=True)
def scheduled_total_time(context):
    return "%d" % (context['schedules'].num_hours() or 0)

@register.simple_tag(takes_context=True)
def possible_total_user_time(context, user):
    hours = Schedule.available_business_hours(context['date'].year, context['date'].month, user)
    msg = "%d" % hours['num_hours']
    if hours['leave_hours']>0:
        msg += "<br/> (%d off days)" % (hours['leave_hours']/8)
    return msg

@register.simple_tag(takes_context=True)
def scheduled_total_user_billable(context, user):
    return _format_money(context['schedules'].billable_for_user(user))

@register.simple_tag(takes_context=True)
def actual_total_user_billable(context, user):
    return _format_money(context['actuals'].billable_for_user(user), trailing_slash=True)

@register.simple_tag(takes_context=True)
def scheduled_total_business_billable(context, business):
    return _format_money(context['schedules'].billable_for_business(business))

@register.simple_tag(takes_context=True)
def actual_total_business_billable(context, business):
    return _format_money(context['actuals'].billable_for_business(business), trailing_slash=True)

def _format_money(x, trailing_slash=False):
    if not x:
        return ""
    msg = "R" + intcomma(int(x or 0))
    if trailing_slash:
        msg += " / "
    return msg
