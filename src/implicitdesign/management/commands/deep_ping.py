import logging
import sys
from time import time

from django.core.management.base import BaseCommand
from timepiece.models import *

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    args = ""

    help = """Does a sanity check on the server. The response code
    should be 0 for no problems, 1 for warning and 2 for critical. Also
    it should print a single line of text to be displayed on the screen
    as a summary."""

    def handle(self, *args, **options):

        msgs = []
        worst_exit_code = 0

        for func in [self._check_database_connection]:
            exit_code, msg = func()
            msgs.append(msg)
            if exit_code > worst_exit_code:
                worst_exit_code = exit_code
        print(" | ".join(msgs))
        sys.exit(worst_exit_code)

    def _check_database_connection(self):
        try:
            max_seconds = 1
            start = time()
            User.objects.all().count()
            end = time()
            if end - start > max_seconds:
                return 1, "Db check slow"
            return 0, "Db check ok"
        except Exception as ex:
            logger.debug(ex)
            return 2, "Db check failed"
