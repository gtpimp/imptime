from timepiece.checklist_plugins.base_plugin import BasePlugin
from django.db.models import Q, Avg, Sum, Max, Min

class IssuesEstimatesPlugin(BasePlugin):

    def __init__(self, business, name="estimates", *args, **kwargs):
        super(IssuesEstimatesPlugin, self).__init__(business=business, name=name, *args, **kwargs)

    def check_for_problems(self):
        from timepiece import models as timepiece
        problems = []
        projects = timepiece.Project.objects.all().filter(business=self.business).filter_open().filter_in_dev_or_pending()
        unestimated_issues = timepiece.Issue.objects.all().filter(project__in=projects).annotate(estimate=Sum('issue_points__points')).filter(estimate=0)[0:5]
        for issue in unestimated_issues:
            problems.append(self._create_problem_item(msg="Issue %s in sprint %s has no estimate"%(issue.number, issue.project), issue=issue))
        return problems
    
