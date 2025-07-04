from timepiece.checklist_plugins.base_plugin import BasePlugin
from datetime import datetime
from django.db.models import Q, Avg, Sum, Max, Min

class DeadlinesPlugin(BasePlugin):

    def __init__(self, business, name="deadlines", *args, **kwargs):
        super(DeadlinesPlugin, self).__init__(business=business, name=name, *args, **kwargs)

    def check_for_problems(self):
        from timepiece import models as timepiece
        problems = []
        today = datetime.today()
        projects = timepiece.Project.objects.all().filter(business=self.business).filter_open()

        for project in projects.filter_in_dev().filter(Q(start_dev_at__isnull=True)|Q(start_internal_qa_at__isnull=True)|Q(start_client_qa_at__isnull=True)|Q(invoice_at__isnull=True)):
            problems.append(self._create_problem_item(msg="%s has missing deadlines"%(project), project=project))

        for project in projects.filter_in_dev().filter(start_client_qa_at__lte=today):
            problems.append(self._create_problem_item(msg="%s has missed a deadline to go into client qa on %s"%(project, project.start_internal_qa_at), project=project))

        for project in projects.filter_in_client_qa().filter(invoice_at__lte=today):
            problems.append(self._create_problem_item(msg="%s has missed a deadline to be invoiced on %s"%(project, project.invoice_at), project=project))
            
        return problems
    
