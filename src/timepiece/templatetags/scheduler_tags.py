from django import template
register = template.Library()
from timepiece.models import Schedule

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
def scheduled_total_user_time(context, user):
    return "%d" % (context['schedules'].hours_for_user(user.id) or 0)

@register.simple_tag(takes_context=True)    
def scheduled_total_business_time(context, business):
    return "%d" % (context['schedules'].hours_for_business(business.id) or 0)

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
