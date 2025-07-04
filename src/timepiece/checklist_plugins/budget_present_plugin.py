from timepiece.checklist_plugins.base_plugin import BasePlugin
from django.db.models import Q, Avg, Sum, Max, Min

class BudgetPresetPlugin(BasePlugin):

    def __init__(self, business, name="budget", *args, **kwargs):
        super(BudgetPresetPlugin, self).__init__(business=business, name=name, *args, **kwargs)

    def check_for_problems(self):
        from timepiece import models as timepiece
        problems = []
        no_budget_projects = timepiece.Project.objects.all().filter(business=self.business).filter_open().filter_in_dev().filter(Q(budget__isnull=True)|Q(budget=0)).order_by("order")
        for no_budget_project in no_budget_projects:
            problems.append(self._create_problem_item(msg="%s has no budget"%(no_budget_project), project=no_budget_project))
        return problems
    
