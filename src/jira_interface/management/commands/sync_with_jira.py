from django.core.management.base import BaseCommand, CommandError
from emacs_importer.tasks import import_timesheets_from_emacs
from django.utils import simplejson
import os
from implicitdesign import settings
from django.core.mail import send_mail
from jira_interface.jira_sync import JiraSync
import timepiece.models as timepiece

class Command(BaseCommand):

    help = '''Fetches changes from Jira and pushes changes to Jira. Pass in the business_id to be synced '''

    def handle(self, business_id, *args, **options):

        business_id = int(business_id)
        syncer = JiraSync(business_id)
        syncer.sync()
        
        
