from timepiece.checklist_plugins.base_plugin import BasePlugin
from django.db.models import Q, Avg, Sum, Max, Min

class IssuesAssignedPlugin(BasePlugin):

    def __init__(self, business, name="assigned", *args, **kwargs):
        super(IssuesAssignedPlugin, self).__init__(business=business, name=name, *args, **kwargs)

    def check_for_problems(self):
        from timepiece import models as timepiece
        problems = []
        projects = timepiece.Project.objects.all().filter(business=self.business).filter_open().filter_in_dev()
        unassigned_issues = timepiece.Issue.objects.all().filter(project__in=projects, assigned_to__isnull=True)[0:5]
        for issue in unassigned_issues:
            problems.append(self._create_problem_item(msg="Issue %s in %s is not assigned"%(issue.number, issue.project), issue=issue))
        return problems
    
