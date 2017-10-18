from django.core.management.base import BaseCommand, CommandError
from timepiece import models
import signal
import os
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.auth.models import User
import imaplib2, time
from threading import Thread, Event
import logging
logger = logging.getLogger(__name__)

class Command(BaseCommand):

    PID_FILENAME = "/tmp/create_issues_from_incoming_email.pid"

    def add_arguments(self, parser):
        parser.add_argument('action', type=str, default="start")
    
    def handle(self, *args, **kwargs):
        if kwargs["action"] == "stop":
            self.stop()
        elif kwargs["action"] == "start":
            self.thread = Thread(target=self.idle)
            self.thread.start()
            self.mail_waiting = Event()
            self.inbox = None
            open(self.PID_FILENAME, "w").write(str(os.getpid()))
        else:
            raise Exception("Unknown action")

    def stop(self):
        if not os.path.exists(self.PID_FILENAME):
            return
        pid = open(self.PID_FILENAME).read()
        os.kill(int(pid), signal.SIGKILL)
        os.remove(self.PID_FILENAME)
        
    def _connect(self):
        logger.info("Creating connection to " + settings.ISSUE_INBOX_HOST)
        self.inbox = imaplib2.IMAP4_SSL(settings.ISSUE_INBOX_HOST)
        self.inbox.login(settings.ISSUE_INBOX_USER, settings.ISSUE_INBOX_PASSWORD)
        self.inbox.select(settings.ISSUE_INBOX_FOLDER)
        logger.info("Connected")

    def _disconnect(self):
        try:
            if self.inbox:
                self.inbox.close()
                self.inbox.logout()
        except Exception, ex:
            logger.info("Couldn't disconnect from IMAP : %s", ex)

    def _force_reconnect(self):
        self._disconnect()
        self._connect()
            
    def idle(self):
        logger.info("Starting imap idle thread")
        try:
            self._connect()
            self.process_inbox()
            while True:
                try:
                    self.process_inbox()
                    self.wait_for_messages()
                except Exception, ex:
                    logger.exception(ex)
                    logger.warning("Reconnecting and re-entering wait loop")
                    time.sleep(5)
                    self._force_reconnect()
        except Exception, ex:
            logger.exception(ex)
        finally:
            self._disconnect()
        logger.info("Leaving imap idle thread")

    def wait_for_messages(self):
        def callback(args):
            self.mail_waiting.set()
        self.inbox.idle(callback=callback)
        logger.info("Waiting for messages")
        self.mail_waiting.wait()
        logger.info("Received messages")
        self.mail_waiting.clear()
            
    def process_inbox(self):
        print "Processing inbox"
        typ, raw_email_numbers = self.inbox.search(None, 'ALL')
        for message_number in raw_email_numbers[0].split():
            type, email = self.inbox.fetch(message_number, '(RFC822)')
            print('Message %s\n%s\n' % (message_number, email[0][1]))
