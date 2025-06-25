from django.core.management.base import BaseCommand, CommandError
from emacs_importer.tasks import import_timesheets_from_emacs
import base64
import requests
from django.utils import simplejson
import os
from implicitdesign import settings
from django.core.mail import send_mail
import logging
logger = logging.getLogger(__name__)

class Command(BaseCommand):

    help = '''Imports the timesheets from emacs into the timepiece
    website. '''

    args = [ "destination_url", "username", "filename", "path" ]

    def handle(self, base_destination_url, username, filename, path, *args, **options):
        """ base_destination_url should not have a trailing slash """

        try:
            url = "http://" + base_destination_url + "/emacs_importer/import_timesheet"
            try:
                response = requests.post(url=url,
                                         data={'username': username},
                                         files={'orgfile': open(os.path.join(path, filename), 'r')})
            except Exception as ex:
                logger.exception(ex)
                try:
                    logger.error("Call to import timesheet failed: %s: %s" % (url, response))
                except:
                    pass
                raise

            print response.content

        except Exception as ex:
            send_mail(subject="Problems importing timesheet",
                      message=str(ex),
                      from_email="info@implicitdesign.co.za",
                      recipient_list=["gtp@implicitdesign.co.za",],
                      fail_silently=True)
            raise ex
