from django import template
register = template.Library()

@register.simple_tag(takes_context=True)
def scheduled_time(context, user, business):

    if not context.get('schedules_by_user_and_business', None):
        x = {}
        for schedule in context['schedules'].values():
            user_id = schedule['user_id']
            business_id = schedule['business_id']
            x.setdefault(user_id, {})
            x[user_id].setdefault(business_id, schedule)
        context['schedules_by_user_and_business'] = x

    try:
        return context['schedules_by_user_and_business'][user.id][business.id]['num_hours']
    except KeyError:
        return ""
    
    
