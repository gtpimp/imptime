from django.core.management.base import BaseCommand, CommandError
from emacs_importer.tasks import import_timesheets_from_emacs
from django.utils import simplejson
import os
from implicitdesign import settings
from django.core.mail import send_mail
from jira_interface.jira_sync import JiraSync
import timepiece.models as timepiece

class Command(BaseCommand):

    help = '''For testing purposes, do not use '''

    def handle(self, *args, **options):

        timepiece_issue = timepiece.Issue.objects.get(subject__contains='CLVBENDEXT-112')
        jira_issue_key = timepiece_issue.interface_plugin_number
        sprint = timepiece_issue.project.interface_plugin_number

        syncer = JiraSync(request=None, timepiece_business_id=timepiece_issue.project.business.id)
        syncer._connect()

        try:
            syncer.gh.add_issues_to_sprint(sprint, [jira_issue_key])
            print( "Done" )
        except Exception as ex:
            print( str(ex) )

        
            
