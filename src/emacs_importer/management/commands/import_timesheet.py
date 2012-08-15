from django.core.management.base import BaseCommand, CommandError
from emacs_importer.tasks import import_timesheets_from_emacs

class Command(BaseCommand):
    args = ''
    help = 'Imports the timesheets from emacs into the timepiece website'

    def handle(self, *args, **options):
        import_timesheets_from_emacs()
