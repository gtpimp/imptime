from timepiece.checklist_plugins.base_plugin import BasePlugin
from datetime import datetime
from django.db.models import Q, Avg, Sum, Max, Min

class TestablePlugin(BasePlugin):

    def __init__(self, business, name="testable", *args, **kwargs):
        super(TestablePlugin, self).__init__(business=business, name=name, *args, **kwargs)

    def check_for_problems(self):
        from timepiece import models as timepiece
        problems = []
        projects = timepiece.Project.objects.all().filter(business=self.business).filter_open().filter_in_dev()

        for issue in timepiece.Issue.objects.filter(project__in=projects, adhoc=False).exclude(description__icontains="testable")[0:10]:
            problems.append(self._create_problem_item(msg="issue%s in %s has no testable"%(issue.number, issue.project), issue=issue))
            
        return problems
    
