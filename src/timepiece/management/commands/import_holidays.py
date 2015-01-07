from django.core.management.base import BaseCommand, CommandError
from timepiece import models as timepiece
from datetime import date
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.auth.models import User
import logging
logger = logging.getLogger(__name__)
import requests

class Command(BaseCommand):

    help = "import public holidays"
    
    def handle(self, **kwargs):
        try:

            for year in [ date.today().year-1, date.today().year, date.today().year+1 ]:
            
                url = "http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForYear&year=%s&country=zaf" % year
                holidays = requests.get(url=url).json()

                holiday_ids = []
                for holiday in holidays:
                    applies_on = date(year=holiday['date']['year'], month=holiday['date']['month'], day=holiday['date']['day'])
                    holiday_ids.append( timepiece.Holiday.objects.get_or_create(applies_on=applies_on,
                                                                                defaults={'name':holiday['englishName']})[0].id )
                timepiece.Holiday.objects.filter(applies_on__year=year).exclude(pk__in=holiday_ids).delete()
                    
        except Exception, ex:
            logger.exception(ex)
            raise
        
