from django.core.management.base import BaseCommand, CommandError
from timepiece import models
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.db.models import User

class Command(BaseCommand):

    args = "None"
    help = "Import one redmine sprint into the timesheet system"

    def handle(self, *args, **kwargs):

        redmine_db_name = 'redmine_projects'
        redmine_business_name = 'fixico'
        redmine_sprint_name = 'sprint6'
        timepiece_sprint_id = 1305
        timepiece_username = 'keith'
        
        timepiece_user = User.objects.get(username=timepiece_username)

        print("making connection to %s" % settings.DATABASES[redmine_db_name]['NAME'])
        redmine_issues_qs = redmine_models.RedmineIssue.objects.using(redmine_db_name).all()
        redmine_issues_qs = redmine_issues_qs.filter(project__name=redmine_business_name).filter(fixed_version__name=redmine_sprint_name)
        redmine_issues = list(redmine_issues_qs)
        print("%d issues fetched" % len(redmine_issues))

        timepiece_sprint = models.Project.objects.get(pk=timepiece_sprint_id)

        num_handled = 0
        for redmine_issue in redmine_issues:
            
            try:
                issue = models.Issue.objects.get(project=timepiece_sprint, number=redmine_issue.id)
            except models.Issue.DoesNotExist:
                issue = models.Issue.objects.create(project=timepiece_sprint, 
                                                    number=redmine_issue.id,
                                                    status=redmine_issue.status.name,
                                                    subject=redmine_issue.subject or '',
                                                    description=redmine_issue.description or '',
                                                    story_points=redmine_issue.story_points)
            num_handled += 1
                
            issue_points = models.IssuePoints.objects.get_or_create(user=timepiece_user, issue=issue)[0]
            issue_points.points = issue.story_points
            issue_points.save()

            print("%d issues left to import" % (len(redmine_issues)-num_handled))
        print("handled %d issues.." % num_handled)
