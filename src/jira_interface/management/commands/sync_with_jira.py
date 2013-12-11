from django.core.management.base import BaseCommand, CommandError
from emacs_importer.tasks import import_timesheets_from_emacs
from django.utils import simplejson
import os
from implicitdesign import settings
from django.core.mail import send_mail
from jira.client import JIRA

class Command(BaseCommand):

    help = '''Fetches changes from Jira and pushes changes to Jira '''

    def handle(self, *args, **options):

        server = "https://clevva.atlassian.net"
        options = { 'server': server }
        jira = JIRA(options, basic_auth=('admin', 'admin'))
        
