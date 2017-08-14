from django import template
register = template.Library()
from testable.models import TestableResult

@register.simple_tag(takes_context = True)
def set_test_result(context, testable, testable_session):
    testable.test_result = TestableResult.objects.filter(testable=testable, testable_session=testable_session).first()
    return ""

