from timepiece.checklist_plugins.base_plugin import BasePlugin
from django.db.models import Q, Avg, Sum, Max, Min
from django.contrib.humanize.templatetags.humanize import intcomma

class OverBudgetPlugin(BasePlugin):

    def __init__(self, business, name="budget", *args, **kwargs):
        super(OverBudgetPlugin, self).__init__(business=business, name=name, *args, **kwargs)

    def check_for_problems(self):
        from timepiece import models as timepiece
        problems = []
        projects_with_a_budget = timepiece.Project.objects.all().filter(business=self.business).filter_open().filter_in_dev().filter(budget__gt=0).order_by("order")
        for project in projects_with_a_budget:
            if project.stats['billed'] > project.budget:
                amount_over = project.stats['billed'] - project.budget
                problems.append(self._create_problem_item(msg="%s is R%s over budget"%(project, intcomma(float(amount_over)*100.0/100)), project=project))
        return problems
    
