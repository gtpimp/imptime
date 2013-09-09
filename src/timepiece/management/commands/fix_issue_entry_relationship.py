from django.core.management.base import BaseCommand, CommandError
from timepiece import models
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.auth.models import User

class Command(BaseCommand):

    help = "Associate all entries with their issues where possible"
    
    def handle(self, *args, **kwargs):

        entries = models.Entry.objects.filter(issue__isnull=True)
        count = entries.count()
        for entry in entries:
            issue_id = entry.try_get_issue_id()
            if issue_id is not None:
                try:
                    issue = models.Issue.objects.filter(project=entry.project).get(number=issue_id)
                    entry.issue = issue
                    entry.save()
                except models.Issue.DoesNotExist:
                    pass
            count -= 1
            if count%50 == 0:
                print("%d entries left to associate"%count)
        print("done")

