from django.core.management.base import BaseCommand, CommandError
from emacs_importer.tasks import import_timesheets_from_emacs
from django.utils import simplejson
import os
from implicitdesign import settings
from django.core.mail import send_mail

class Command(BaseCommand):

    help = '''Imports the timesheets from emacs into the timepiece
    website. '''

    def handle(self, *args, **options):
        try:
            import_timesheets_from_emacs()
        except Exception, ex:
            send_mail(subject="Problems importing timesheets",
                      message=str(ex),
                      from_email="info@implicitdesign.co.za",
                      recipient_list=["gtp@implicitdesign.co.za",],
                      fail_silently=True)
            raise ex

        print("Import complete")
