from timepiece.checklist_plugins.base_plugin import BasePlugin
from django.db.models import Q, Avg, Sum, Max, Min
from datetime import datetime
from django.conf import settings

class MissingTimesheetEntriesPlugin(BasePlugin):

    def __init__(self, business, name="timesheet", *args, **kwargs):
        super(MissingTimesheetEntriesPlugin, self).__init__(business=business, name=name, *args, **kwargs)

    def check_for_problems(self):
        from timepiece import models as timepiece
        problems = []

        active_projects = timepiece.Project.objects.all().filter(business=self.business).filter_open().filter_in_dev().order_by("order")
        for project in active_projects:
            most_recent_entry = timepiece.Entry.objects.filter(issue__project=project).order_by("-start_time").first()
            if most_recent_entry is None:
                problems.append(self._create_problem_item(msg="%s hasn't got any time logged"%(project), project=project))
            else:
                num_days_since_last_entry = (datetime.today() - most_recent_entry.start_time).days
                if num_days_since_last_entry > settings.EXPECTING_A_TIMESHEET_ENTRY_EVERY_X_DAYS:
                    problems.append(self._create_problem_item(msg="%s hasn't had any time logged for %d days"%(project, num_days_since_last_entry), project=project))
                
        return problems
