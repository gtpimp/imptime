from base_plugin import BasePlugin
from django.db.models import Q, Avg, Sum, Max, Min

class RatesPlugin(BasePlugin):

    def __init__(self, business, name="rates", *args, **kwargs):
        super(RatesPlugin, self).__init__(business=business, name=name, *args, **kwargs)

    def check_for_problems(self):
        from timepiece import models as timepiece
        problems = []
        for project in timepiece.Project.objects.filter(business=self.business).exclude(Q(status2='closed')|Q(status__label='closed')).order_by("order"):
            problems.append(self._create_problem_item(msg="Sprint %s has no rates"%project.name, project=project))
        return problems
    