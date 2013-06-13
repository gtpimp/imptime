from django.core.management.base import BaseCommand, CommandError
from timepiece import models
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.auth.models import User

class Command(BaseCommand):

    args = "No options"
    help = "Import all redmine issues into the timesheet system"

    def handle(self, *args, **kwargs):
        #self._handle('redmine_impact', 'impact-spii')
        #self._handle('redmine_projects', 'impact-spii')
        self._handle('redmine_unionswiss', 'unionswiss')

    def _handle(self, redmine_db_name, business_name):
        try:
            business = models.Business.objects.get(name=business_name)
        except models.Business.DoesNotExist:
            raise Exception("No business with name : %s" % business_name)
        models.Issue.objects.filter(project__business=business).delete()
        point_person = User.objects.get_or_create(username='us')[0]

        try:
            project_status = models.Attribute.objects.get(type='project-status', label='open')
        except: 
            project_status = models.Attribute.objects.create(type='project-status', label='open', billable=True, enable_timetracking=True)
        
        try:
            project_type = models.Attribute.objects.get(type='project-type', label='default')
        except:
            project_type = models.Attribute.objects.create(type='project-type', label='default', billable=True, enable_timetracking=True)

        num_created = 0
        print("making connection to %s" % settings.DATABASES[redmine_db_name])
        redmine_issues = list(redmine_models.RedmineIssue.objects.using(redmine_db_name).all())
        print("%d issues fetches" % len(redmine_issues))
        created_list = []
        for redmine_issue in redmine_issues:
            project_code = ""
            try:
                project_name = "%s - %s" % (redmine_issue.project.name, redmine_issue.fixed_version.name if (redmine_issue.fixed_version_id>0 and redmine_issue.fixed_version is not None) else '')
                project_code = models.Project.get_code_from_name(project_name)
            except Exception:
                raise Exception("Invalid issue configuration for %d: version_id=%s" % (redmine_issue.id, redmine_issue.fixed_version_id))
            try:
                project = models.Project.objects.get(business=business,
                                                     code= project_code)
            except models.Project.DoesNotExist:
                print("Creating project for : %s" % project_name)
                project = models.Project(business=business, name=project_name)
                created_list.append((project,project.id,project.name, project.code, project_code))
            except models.Project.MultipleObjectsReturned:
                print("%d objects found with business '%s' and name '%s' code '%s'"%(models.Project.objects.filter(business=business,code = project_code).count(),business.name,project_name,project_code))
                raise

            project.point_person_id=point_person.id
            project.status=project_status
            project.type=project_type
            project.save()
                
            models.Issue.objects.create(project=project, 
                                        number=redmine_issue.id,
                                        status=redmine_issue.status.name,
                                        subject=redmine_issue.subject or '',
                                        description=redmine_issue.description or '',
                                        story_points=redmine_issue.story_points)
            num_created += 1
            if num_created % 50 == 0:
                print("%d issues left to import" % (len(redmine_issues)-num_created))
        print("created %d issues.." % num_created)
        for creation in created_list:
            print "%s: id: %s, name: %s code:%s expectedcode:%s"%tuple([str(i) for i in creation])
