import re
from django.contrib.humanize.templatetags.humanize import intcomma
from django.utils.safestring import mark_safe
from django import template
register = template.Library()

class_re = re.compile(r'(?<=class=["\'])(.*)(?=["\'])')
@register.filter
def currency(amount):
    if not amount:
        return ""
    amount = round(float(amount), 2)
    return "%s%s" % (intcomma(int(amount)), ("%0.2f" % amount)[-3:])

