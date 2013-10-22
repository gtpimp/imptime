from django.core.management.base import BaseCommand, CommandError
from timepiece import models
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail

class Command(BaseCommand):

    args = "No options"
    help = "Import all redmine issues into the timesheet system"

    def handle(self, *args, **kwargs):

        models.Issue.objects.all().exclude(project__business__name="koen").exclude(project__business__name="unionswiss").exclude(project__business__name="impact").delete()

        #models.Issue.objects.all().filter(project__business__name="impact").delete()
        #self._handle('redmine_impact', 'impact')

        #models.Issue.objects.all().filter(project__business__name="koen").delete()
        #self._handle('redmine_hfm', 'koen')

        self._handle('redmine_projects', None)
        #self._handle('redmine_unionswiss', 'unionswiss')

    def _handle(self, redmine_db_name, given_business_name=None):

        missing_projects = set()
        missing_businesses = set()

        print("making connection to %s" % settings.DATABASES[redmine_db_name]['NAME'])
        redmine_issues_qs = redmine_models.RedmineIssue.objects.using(redmine_db_name).all()
        redmine_issues = list(redmine_issues_qs)
        print("%d issues fetched" % len(redmine_issues))

        if given_business_name is not None:
            try:
                business = models.Business.objects.get(name=given_business_name)
            except models.Business.DoesNotExist:
                raise Exception("No business with name : %s" % given_business_name)
        else:
            business = None

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
        for redmine_issue in redmine_issues:
            business_name = given_business_name
            if given_business_name is None:
                business = None
            project_code = ""

            if redmine_issue.fixed_version_id==0 or redmine_issue.fixed_version is None:
                continue

            try:
                project_name = redmine_issue.fixed_version.name
            except Exception:
                raise Exception("Invalid issue configuration for %d: version_id=%s" % (redmine_issue.id, redmine_issue.fixed_version_id))
            if business is None:
                business_name = models.RedmineToTimepieceBusinessMapping.find_from_redmine(redmine_issue.project.name)
                try:
                    business = models.Business.objects.get(name=business_name)
                except models.Business.DoesNotExist:
                    missing_businesses.add( (business_name, redmine_issue.project.name) )
                    continue
            else:
                # Projects like this have sub-projects, so add them to the sprint name
                project_name = "%s - %s" % (redmine_issue.project.name, project_name)

            project_name = models.RedmineToTimepieceProjectMapping.find_from_redmine(business.name,project_name)
            project_code = models.Project.get_code_from_name(project_name)
            try:
                project = models.Project.objects.get(business=business,
                                                     code=project_code)
                project.point_person_id=point_person.id
                project.status=project_status
                project.type=project_type
                project.save()
            except models.Project.DoesNotExist:
                project = None
                missing_projects.add( (business.name,project_name,"Possible projects are: %s" % (list(p.name for p in models.Project.objects.filter(business=business))) ) )
                continue
            except models.Project.MultipleObjectsReturned:
                print("%d objects found with business '%s' and name '%s' code '%s'"%(models.Project.objects.filter(business=business,code = project_code).count(),business.name,project_name,project_code))
                raise
            
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

        missing_info = ""
        if len(missing_businesses)>0:
            missing_info += "\n\nMissing businesses: \n  %s" % "\n  ".join( (str(x) for x in missing_businesses))
            missing_info += "\nPossible businesses are: %s" % (list(b.name for b in models.Business.objects.all()))
            missing_info += "\nUse this command to add a business mapping \n" +\
                              "python manage.py add_business_mapping '<redmine_business_name>' '<timepiece_business_name>'"
        if len(missing_projects)>0:
            missing_info += "\n\nMissing projects: \n  %s" % "\n  ".join( (str(x) for x in missing_projects))
            missing_info += "\nUse this command to add a project mapping \n" +\
                              "python manage.py add_project_mapping <business_name> '<redmine_project_name>' '<timepiece_project_name>'"

        print missing_info
        if len(missing_info)>0:
            send_mail(subject="Problems importing from redmine",
                      message=missing_info,
                      from_email="info@implicitdesign.co.za",
                      recipient_list=["gtp@implicitdesign.co.za",],
                      fail_silently=False)
