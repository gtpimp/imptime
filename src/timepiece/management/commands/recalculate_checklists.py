from django.core.management.base import BaseCommand, CommandError
from timepiece import models as timepiece
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.auth.models import User
import logging
logger = logging.getLogger(__name__)

class Command(BaseCommand):

    help = "recalculate all checklists"
    
    def handle(self, **kwargs):

        try:
            user = User.objects.filter(is_superuser=True).first() # pick pretty much any user for the created_by/modified_by field, this is an automated task

            for business in timepiece.Business.objects.filter_has_at_least_one_open_project():
                timepiece.DevChecklist.get_todays_checklist(user, business).recalculate_all()
                timepiece.TrafficChecklist.get_todays_checklist(user, business).recalculate_all()
                timepiece.FinanceChecklist.get_todays_checklist(user, business).recalculate_all()
        except Exception as ex:
            logger.exception(ex)
            raise
        
