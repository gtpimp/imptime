from django.core.management.base import BaseCommand, CommandError
from emacs_importer.tasks import import_timesheets_from_emacs
from django.utils import simplejson
import os
from implicitdesign import settings

class Command(BaseCommand):

    help = '''Imports the timesheets from emacs into the timepiece
    website. '''

    def handle(self, *args, **options):
        import_timesheets_from_emacs()
        print("Import complete")
