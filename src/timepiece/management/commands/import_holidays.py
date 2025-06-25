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
            
                url = "https://kayaposoft.com/enrico/json/v2.0/?action=getHolidaysForYear&year=%s&country=zaf&holidayType=public_holiday" % year
                
                holidays = requests.get(url=url).json()

                holiday_ids = []
                for holiday in holidays:
                    name = holiday['name'][0]['text']
                    applies_on = date(year=holiday['date']['year'], month=holiday['date']['month'], day=holiday['date']['day'])
                    holiday_ids.append( timepiece.Holiday.objects.get_or_create(applies_on=applies_on,
                                                                                defaults={'name':name})[0].id )
                    print("Updated holiday %s on %s" % (name, applies_on))

                timepiece.Holiday.objects.filter(applies_on__year=year).exclude(pk__in=holiday_ids).delete()
                    
        except Exception as ex:
            logger.exception(ex)
            raise
        
