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

    def handle(self, *args, **kwargs):
        self.thread = Thread(target=self.idle)
        self.thread.start()
 
    def idle(self):
        logger.info("Starting imap idle thread")
        try:
            while True:

                logger.info("Creating connection to " + settings.ISSUE_INBOX_HOST)
                self.connection = imaplib2.IMAP4_SSL(settings.ISSUE_INBOX_HOST)
                self.connection.login(settings.ISSUE_INBOX_USER, settings.ISSUE_INBOX_PASSWORD)
                self.connection.select(settings.ISSUE_INBOX_FOLDER)
                logger.info("Connected")
                
                try:
                    import pdb; pdb.set_trace()
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
        except Exception, ex:
            logger.exception(ex)
        finally:
            logger.info("Logging out")
            self.connection.close()
            self.connection.logout()
            logger.info("Leaving imap idle thread")
 
    def handle_email(self, args):
        print "Got an event!: %s" % args
