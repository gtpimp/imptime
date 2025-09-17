import logging
import time

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import OperationalError, connections

logger = logging.getLogger(__name__)


class Command(BaseCommand):

    help = "Waits for the database to become available"

    def can_connect(self):
        print("checking database connection with settings:")
        print(settings.DATABASES["default"])
        db_conn = connections["default"]
        try:
            c = db_conn.cursor()
        except OperationalError:
            return False
        else:
            return True

    def handle(self, **kwargs):
        while not self.can_connect():
            print(settings.DATABASES["default"])
            print("retrying in 5 seconds")
            time.sleep(5)
        print("db available")
