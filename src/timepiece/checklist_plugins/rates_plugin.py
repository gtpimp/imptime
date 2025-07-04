from timepiece.checklist_plugins.base_plugin import BasePlugin
from django.db.models import Q, Avg, Sum, Max, Min

class RatesPlugin(BasePlugin):

    def __init__(self, business, name="rates", *args, **kwargs):
        super(RatesPlugin, self).__init__(business=business, name=name, *args, **kwargs)

    def check_for_problems(self):
        from timepiece import models as timepiece
        problems = []
        open_projects = timepiece.Project.objects.all().filter(business=self.business).filter_open().order_by("order")

        invalid_rates = timepiece.Rate.objects.filter(project__in=open_projects).filter(Q(billable_amount__isnull=True)|Q(billable_amount=0)|\
                                                                                        Q(amount__isnull=True)|Q(amount=0)|\
                                                                                        Q(velocity__isnull=True)|Q(velocity=0))
        for invalid_rate in invalid_rates.order_by("project__name"):
            if timepiece.Entry.objects.filter(issue__project=invalid_rate.project, user=invalid_rate.user).count()>0 or \
                  timepiece.Issue.objects.filter(project=invalid_rate.project, assigned_to=invalid_rate.user).count()>0:
                problems.append(self._create_problem_item(msg="User %s in sprint %s has no rate"%(invalid_rate.user.username, invalid_rate.project), project=invalid_rate.project))
        return problems
    
