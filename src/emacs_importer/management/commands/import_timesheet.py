import os

from django.core.mail import send_mail
from django.core.management.base import BaseCommand, CommandError
from django.utils import simplejson
from emacs_importer.tasks import import_timesheets_from_emacs
from implicitdesign import settings


class Command(BaseCommand):

    help = """Imports the timesheets from emacs into the timepiece
    website. """

    def handle(self, *args, **options):

        try:
            status = import_timesheets_from_emacs()
        except Exception as ex:
            send_mail(
                subject="Problems importing timesheets",
                message=str(ex),
                recipient_list=[
                    "gtp@implicitdesign.co.za",
                ],
                from_email=settings.FROM_EMAIL,
                fail_silently=True,
            )
            raise ex

        if len(status["infos"]) > 0:
            send_mail(
                subject="Warnings importing timesheets",
                message="\n".join(status["infos"]),
                recipient_list=[
                    "gtp@implicitdesign.co.za",
                ],
                from_email=settings.FROM_EMAIL,
                fail_silently=False,
            )

            print("Some warnings during import:")
            print("\n".join(status["infos"]))

        if len(status["errors"]) > 0:
            send_mail(
                subject="Problems importing timesheets",
                message="\n".join(status["errors"]),
                recipient_list=[
                    "gtp@implicitdesign.co.za",
                ],
                from_email=settings.FROM_EMAIL,
                fail_silently=False,
            )

            print("Some errors during import:")
            print("\n".join(status["errors"]))
            print("Import failed")
        else:
            print("Import complete")
