from django.core.management.base import BaseCommand, CommandError
from timepiece.models import Project as Sprint
import json
from django.core.mail import send_mail
from timepiece.models import Business as Project
from timepiece.models import Activity, Entry, Location, Attribute, Issue, Feature, IssueStatus, IssueComment, IssueAttachment
from timepiece.models import ProjectIssueOrder as SprintIssueOrder
from timepiece.models import ProjectStatus as SprintStatus
from imptime.models import VisualSpecDocument
from emacs_importer.orgnode import makelist_from_file, makelist_from_string
import html2text
import signal
import os
from django.core.files import File as DjangoFile
from datetime import datetime
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.auth.models import User
import time
from threading import Thread, Event
import logging
logger = logging.getLogger(__name__)
import email
import boto3

class Command(BaseCommand):

    PID_FILENAME = "/tmp/create_issues_from_incoming_aws_queue.pid"

    def add_arguments(self, parser):
        parser.add_argument('action', type=str, default="start")
    
    def handle(self, *args, **kwargs):
        if kwargs["action"] == "stop":
            self.stop()
        elif kwargs["action"] == "start":
            self.start()
        elif kwargs["action"] == "start_no_thread":
            self.idle()
        else:
            raise Exception("Unknown action")

    def stop(self):
        if not os.path.exists(self.PID_FILENAME):
            return
        logger.info("Stopping")
        pid = open(self.PID_FILENAME).read()
        try:
            os.kill(int(pid), signal.SIGKILL)
        except OSError:
            logger.info("Failed to kill existing process with pid %s, assuming already dead so ignoring" % pid)
            pass
        os.remove(self.PID_FILENAME)
        logger.info("Stopped")

    def start(self):
        self.stop()
        self.sqs_listener = None
        self.thread = Thread(target=self.idle)
        self.thread.start()
        open(self.PID_FILENAME, "w").write(str(os.getpid()))
        
    def _connect(self):
        logger.info("Creating sqs connection to " + settings.IMPBOX_SQS_INCOMING_QUEUE_NAME)

        self.sqs=boto3.resource('sqs',
                                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                                region_name=settings.IMPBOX_SQS_REGION_NAME)
        self.queue=self.sqs.get_queue_by_name(QueueName=settings.IMPBOX_SQS_INCOMING_QUEUE_NAME)
        self.s3 = boto3.resource('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                     aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                                     region_name=settings.IMPBOX_S3_REGION_NAME)
        self.s3_bucket = self.s3.Bucket(settings.IMPBOX_S3_BUCKET_NAME)
        logger.info("Connected")

    def _disconnect(self):
        self.queue = None
        self.sqs = None
        self.s3 = None
        self.s3_bucket = None
        
    def idle(self):
        logger.info("Starting sqs idle thread")
        try:
            self._connect()
            while True:
                try:
                    logger.info("Waiting for messages messages")
                    sqs_messages = self.queue.receive_messages(WaitTimeSeconds=20)
                    logger.info("Got %d messages" % len(sqs_messages))
                    if len(sqs_messages) > 0:
                        for sqs_message in sqs_messages:
                            self.process_sqs_message(sqs_message)
                            logger.info("Done, deleting sqs message %s" % sqs_message)
                            sqs_message.delete()
                except Exception, ex:
                    logger.exception(ex)
                    logger.warning("Reconnecting and re-entering wait loop")
                    time.sleep(5)
                    self._disconnect()
                    self._connect()
        except Exception, ex:
            logger.exception(ex)
        finally:
            self._disconnect()
        logger.info("Leaving sqs listener idle thread")

    def process_sqs_message(self, sqs_message):
        logger.info("Processing sqs message %s" % sqs_message)
        sqs_message_body=json.loads(json.loads(sqs_message.body)['Message'])
        if 'mail' not in sqs_message_body:
            logger.info("Ignoring sqs message which isn't an email: %s" % sqs_message)
            return
            
        email_s3_id = sqs_message_body['mail']['messageId']
        temp_file_path = os.path.join(settings.ISSUE_INBOX_TEMP_FOLDER, email_s3_id)
        self.s3_bucket.download_file(email_s3_id, temp_file_path)
        raw_email_message = open(temp_file_path).read()
        self.process_email_message(raw_email_message)

    def process_email_message(self, raw_email_message):
        logger.info("Processing raw email message: %s..." % raw_email_message[0:200])
        
