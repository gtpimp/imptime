from django.core.management.base import BaseCommand, CommandError
from timepiece import models
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.auth.models import User
import imaplib2, time
from threading import Thread, Event
import logging
logger = logging.getLogger(__name__)

class Command(BaseCommand):

    def handle(self, redmine_business_name, timepiece_business_name, force=False, **kwargs):

        self.connection = imaplib2.IMAP4_SSL(settings.ISSUE_INBOX_HOST)
        self.connection.login(settings.ISSUE_INBOX_USER, settings.ISSUE_INBOX_PASSWORD)
        self.connection.select(settings.ISSUE_INBOX_FOLDER)
        
        self.thread = Thread(target=self.idle)
        self.thread.start()
 
    def join(self):
        self.thread.join()
 
    def idle(self):
        try:
            while True:
                try:
                    self.needsync = False
                    def callback(args):
                        self.handle_email(args)
                    self.connection.idle(callback=callback)
                    Event().wait()
                except Exception, ex:
                    logger.exception(ex)
                    try:
                        self.connection.close()
                        self.connection.logout()
                    except Exception:
                        pass
                    time.sleep(10)
                    logger.info("Restarting in 10 seconds")
                finally:
                    self.connection.close()
                    self.connection.logout()
        finally:
            self.connection.close()
            self.connection.logout()
 
    def handle_email(self, args):
        print "Got an event!"
