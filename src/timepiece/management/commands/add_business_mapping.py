from django.core.management.base import BaseCommand, CommandError
from timepiece import models
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.auth.models import User

class Command(BaseCommand):

    args = "redmine_business_name, timepiece_business_name, force"
    help = "Associate a redmine business name with timepiece business name. If timepiece_business_name does not exist and force=True then it will be created."
    
    def handle(self, redmine_business_name, timepiece_business_name, force=False, **kwargs):
        
        try:
            models.Business.objects.get(name=timepiece_business_name)
        except models.Business.DoesNotExist:
            if force:
                models.Business.objects.create(name=timepiece_business_name)
            else:
                raise Exception("Invalid timepiece_business_name: %s" % timepiece_business_name)
        models.RedmineToTimepieceBusinessMapping.objects.get_or_create(redmine_business_name=redmine_business_name,timepiece_business_name=timepiece_business_name)
        print("Mapping created from redmine business name=%s to timepiece business name=%s" % (redmine_business_name,timepiece_business_name))

