from django.core.management.base import BaseCommand, CommandError
from timepiece import models
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.auth.models import User

class Command(BaseCommand):

    args = "timepiece_business_name, redmine_project_name, timepiece_project_name, force"
    help = "Associate a redmine project name with timepiece project name. If timepiece_project_name does not exist and force=True then it will be created."
    
    def handle(self, timepiece_business_name, redmine_project_name, timepiece_project_name, force=False, **kwargs):
        if force == 'True':
            force = True

        point_person = User.objects.get_or_create(username='us')[0]
        try:
            project_status = models.Attribute.objects.get(type='project-status', label='open')
        except: 
            project_status = models.Attribute.objects.create(type='project-status', label='open', billable=True, enable_timetracking=True)
        
        try:
            project_type = models.Attribute.objects.get(type='project-type', label='default')
        except:
            project_type = models.Attribute.objects.create(type='project-type', label='default', billable=True, enable_timetracking=True)

        redmine_project_code = models.Project.get_code_from_name(redmine_project_name)
        timepiece_project_code = models.Project.get_code_from_name(timepiece_project_name)
        business = models.Business.objects.get(name=timepiece_business_name)
        try:
            models.Project.objects.get(code=timepiece_project_code, business=business)
        except models.Project.DoesNotExist:
            if force:
                models.Project.objects.create(name=timepiece_project_name, business=business, code=timepiece_project_code,
                                              point_person_id=point_person.id,
                                              status=project_status,
                                              type=project_type)
            else:
                raise Exception("Invalid timepiece_project_name: %s (%s)" % (timepiece_project_name,timepiece_project_code))
        models.RedmineToTimepieceProjectMapping.objects.get_or_create(timepiece_business_name=business.name,
                                                                      redmine_project_code=redmine_project_code,
                                                                      timepiece_project_code=timepiece_project_code)
        print("Mapping created from redmine project name=%s to timepiece project name=%s" % (redmine_project_code,timepiece_project_code))

