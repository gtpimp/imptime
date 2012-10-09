from django.core.management.base import BaseCommand, CommandError
from emacs_importer.tasks import import_timesheets_from_emacs
from django.utils import simplejson
import os
from implicitdesign import settings

class Command(BaseCommand):
    args = 'users'

    help = '''Imports the timesheets from emacs into the timepiece
    website. Users is a comma separated list of usernames to process
    (or empty for all)'''

    def handle(self, users=None, *args, **options):
        if users is not None:
            users = users.split(",")
        status = import_timesheets_from_emacs(users=users)

        print("Import complete")
        print("Unknown entries saved to : %s" % os.path.join(settings.MEDIA_ROOT,"unknown_redmine_entries"))

