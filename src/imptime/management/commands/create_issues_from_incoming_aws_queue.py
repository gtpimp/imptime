from django.core.management.base import BaseCommand, CommandError
from timepiece.models import Project as Sprint
import json
from django.core.mail import EmailMessage
from timepiece.models import Business as Project
from timepiece.models import Activity, Entry, Location, Attribute, Issue, IssueStatus, IssueComment
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
        elif kwargs["action"] == "test":
            self.test()
        else:
            raise Exception("Unknown action")

    def test(self):
        raw_email_message = """Return-Path: <gtp@impd.co.za>
Received: from implicitdesign.co.za (impd.co.za [197.242.72.50])
 by inbound-smtp.eu-west-1.amazonaws.com with SMTP id s225sj16aum59auh7cdittjjj1sifvsao0oq37o1
 for yucky@imptime.com;
 Sat, 24 Mar 2018 11:21:55 +0000 (UTC)
X-SES-Spam-Verdict: PASS
X-SES-Virus-Verdict: PASS
Received-SPF: pass (spfCheck: domain of impd.co.za designates 197.242.72.50 as permitted sender) client-ip=197.242.72.50; envelope-from=gtp@impd.co.za; helo=impd.co.za;
Authentication-Results: amazonses.com;
 spf=pass (spfCheck: domain of impd.co.za designates 197.242.72.50 as permitted sender) client-ip=197.242.72.50; envelope-from=gtp@impd.co.za; helo=impd.co.za;
X-SES-RECEIPT: AEFBQUFBQUFBQUFHWElRd0RuOTFIRzRvdUs2a3czN0ZMRFhDUkZIV0M4MktLY0xBZzd3ZTNEUWxieHZUWFpnSjFIaEhneFMrWmVrYkhlbTFnc3g2OVl3TVJqT2M1aDdIdmRWZ0h4Sk1HaHdKSFJ1eGp0K0lsSXdHUUFlYkJGRk9wUWpIcjdTVmhuZG9nbVpWSmwrdElpcEVNMmlYbnVnSnVxRHRiYlV0MXdSc0xDZU5Qa1ZENDFtVlZmbGo4QjljL2R0R2g2cnNUZjh5RnJ0VndCTS9TOGVwK1oxM0xxZ2FoajlaVmV0eDZsYkZRcUhEcVhzbk53YVBST2JmbytxQ3ppdXM3REpoSTZPMm5OTkd1bVA2ZkxjUi9mZXJldktmTE9Yb3RjbldyUnFtWEtYczBZeFd5VUE9PQ==
X-SES-DKIM-SIGNATURE: a=rsa-sha256; q=dns/txt; b=gtCgUY7sCvtkIA86CvGfDywI/NI7YT5mc1DTfbeRCJbEJWWdRDvonFqfarggSZBEiheE0yJeQu2i1Sm1GYkaW0UEqOECR/NJDT4n25z/wzEwTZaoT4s907/skM5TSH8BgEhXxEMr2y43HxKA3p0uQy8t38zY0KJgVASFD0YUhvA=; c=relaxed/simple; s=uku4taia5b5tsbglxyj6zym32efj7xqv; d=amazonses.com; t=1521890517; v=1; bh=J/rMiMS/8hdwWzoWYDHdxX92AVL3HMlXnu3ily8CfWw=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;
Received: from gtplap3.mail.impd.co.za (unknown [105.225.71.229])
	by implicitdesign.co.za (Postfix) with ESMTPSA id 248C516B69ED
	for <yucky@imptime.com>; Sat, 24 Mar 2018 13:21:52 +0200 (SAST)
User-agent: mu4e 0.9.15; emacs 24.5.1
From: Gareth Priede <gtp@impd.co.za>
To: malcolm@imptime.com
Subject: lucy galloosytx
Date: Sat, 24 Mar 2018 13:21:51 +0200
Message-ID: <87k1u190s0.fsf@impd.co.za>
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="=-=-="

--=-=-=
Content-Type: text/plain


icky is yucky is ploo


--=-=-=
Content-Type: text/plain
Content-Disposition: inline; filename=blah.txt

this is the colour of yukc

--=-=-=--

"""
        self.process_email_message(raw_email_message, "test")
        
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
        self.process_email_message(raw_email_message, email_s3_id)

    def process_email_message(self, raw_email_message, email_s3_id):
        issues_created = []        
        try:
            logger.info("Processing raw email message: %s %s..." % (email_s3_id,raw_email_message[0:500]))
            email_message = email.message_from_string(raw_email_message)
            message = self.unpack_email(email_message)
        except Exception, ex:
            logger.exception(ex)
            EmailMessage(subject="Problems parsing email: %s" % email_s3_id,
                         body=raw_email_message,
                         from_email=settings.FROM_EMAIL,
                         to=settings.EMACS_ADMIN_USER_EMAILS)\
                    .send()
            return

        user_email = message['from']

        try:
            user, project, sprint, default_subject = self.resolve_parts(message)
            user_email = user_email
            raw_issues = self.resolve_issue_content(message, default_subject, project)
            for raw_issue in raw_issues:
                new_issue = self.create_issue(message, user, project, sprint, raw_issue, from_email=user_email)
                logger.debug("Created issue %s %s" % (new_issue.id, new_issue.subject))
                issues_created.append(new_issue)
            self.notify_issues_created(user_email, project, issues_created)
        except Exception, ex:
            logger.exception(ex)
            EmailMessage(subject="Couldn't create issues from email",
                         body="Failed to process your email. Please resend it \n\n%s\n\n%s" % (ex, str(email_message)),
                         from_email=settings.FROM_EMAIL,
                         to=[user_email],
                         bcc=settings.EMACS_ADMIN_USER_EMAILS)\
                    .send()

            
    def unpack_email(self, message):
        res = {
            'from' : email.utils.parseaddr(message['From'])[1],
            'from_name' : email.utils.parseaddr(message['From'])[0],
            'time' : datetime.fromtimestamp(email.utils.mktime_tz(email.utils.parsedate_tz(message['Date']))),
            'to' : message['To'],
            'subject' : email.Header.decode_header(message["Subject"])[0][0],
            'content' : '',
            'files' : []
        }
        for part in message.walk():
            if part.get_content_maintype() == 'multipart':
                continue
            if part.get_filename():
                res['files'].append({'filename': part.get_filename(),
                                     'content_type': part.get_content_type(),
                                     'content': part.get_payload(decode = True)})
            elif part.get_content_maintype() == 'text':
                text = part.get_payload(decode = True)
                if part.get_content_subtype() == "html":
                    res['content'] = html2text.html2text(text.decode('utf8'))
                elif 'content' not in res or not res['content']:
                    # prefer html over plain text
                    res['content'] = text
        return res

    def resolve_parts(self, message):
        user = self.get_user(message)

        project_name = message['to'].split("@")[0]
        subject = message['subject'].strip()
        
        project_name = project_name.strip().lower()

        all_matching_projects = Project.objects.filter(name__iexact=Project.convert_to_email_name(project_name))

        my_matching_projects = all_matching_projects.filter_by_logged_in_user(user)
            
        if my_matching_projects.count() > 1:
            raise Exception("You belong to more than one project matching the name %s, please use an alias" % project_name)
        project = my_matching_projects.first()
        
        if project is None:
            if all_matching_projects.count() > 1:
                raise Exception("There is more than one project matching the name %s, please use an alias" % project_name)
            project = all_matching_projects.first()

            if project is None:
                raise Exception("No project found with name %s which you have access to" % project_name)

        sprint_name = settings.ISSUE_INBOX_DEFAULT_SPRINT_NAME
        sprint = Sprint.objects.get_or_create(business=project,
                                              name=sprint_name,
                                              defaults={'status3': SprintStatus.objects.get_or_create(name='pending',
                                                                                                      business=project)[0],
                                                        'project_type': 'inbox',
                                                        'description': "For incoming unprocessed issues"})[0]
        return user, project, sprint, subject
    
        
    def resolve_issue_content(self, message, default_subject, project):
        content = message['content'].strip()
        raw_issues = []
        if content.startswith("***"):
            orgnodes = makelist_from_string(content)
            for orgnode in orgnodes:
                if orgnode.Level() == 3:
                    subject = orgnode.Heading()
                    description = orgnode.CleanBody()
                    raw_issues.append({'subject': subject,
                                       'description': description})
        else:
            content = content or ''
            raw_issues.append({'subject': default_subject or content[0:20],
                               'description': content})
        return raw_issues
    
    def get_user(self, message):
        from_email = message['from']
        user = User.objects.filter(email=from_email).first()
        if user is None:
            logger.warning("During email issue creation, no user found with email %s, auto creating" % message['from'])
            user = User.objects.create(username=from_email, email=from_email, first_name="", last_name="")
        if not user.is_active:
            logger.warning("During email issue creation, user %s is not active" % user.username)
        return user

    def create_issue(self, message, user, project, sprint, raw_issue, from_email):
        issue = Issue.objects.filter(project=sprint, subject=raw_issue['subject'])\
                             .order_by_project_id(project.id, descending=True)\
                             .first()
        if issue is None:

            issue = Issue.objects.create(project=sprint,
                                         subject=raw_issue['subject'],
                                         auto_created_during_import=True,
                                         issue_type='issue',
                                         status2=IssueStatus.objects.get_or_create(name='new', business=project)[0],
                                         assigned_to=user,
                                         number=Issue.get_next_issue_number(project),
                                         description=raw_issue['description'],
                                         story_points=0,
                                         created=message['time'],
                                         modified=message['time'])
            SprintIssueOrder.insert_at_the_end(issue)

        if user is not None:
            sent_from = "{first_name} {last_name} ({username})".format(first_name=user.first_name,
                                                                       last_name=user.last_name,
                                                                       username=user.username)
        else:
            sent_from = from_email

        comment = """Created by email from {sent_from}. 
Sent at {sent_at} using email address {from_email} """.format(
                        sent_from=sent_from,
                        sent_at=message['time'],
                        from_email=message['from'])
            
        IssueComment.objects.create(issue=issue,
                                    comment=comment,
                                    author=user,
                                    comment_type='correspondence',
                                    created=message['time'],
                                    modified=message['time'])

        for attachment_content in message['files']:
            temp_physical_filename = os.path.join(settings.ISSUE_INBOX_TEMP_ATTACHMENT_FOLDER,
                                                  attachment_content['filename'])
            with open(temp_physical_filename, "wb") as f:
                f.write(attachment_content['content'])
                django_file = DjangoFile(open(temp_physical_filename))

            VisualSpecDocument.create_for_doc(user=user,
                                              project=project,
                                              doc=django_file,
                                              name=attachment_content['filename'],
                                              content_type=attachment_content['content_type'],
                                              issue=issue)
            
        logger.info("Created issue %s for %s by email" % (issue.id, sent_from))
        return issue

    def notify_issues_created(self, sent_from, project, issues_created):

        if len(issues_created) == 1:
            subject = "Issue by email for %s: %s" % (project.name, issues_created[0].subject)
        else:
            subject = "%d issues by email for %s" % (len(issues_created), project.name)

        body = ""
        for issue in issues_created:
            body += "#%s %s\n===============\n%s\n\n" % (issue.number, issue.subject, issue.description)
            
        EmailMessage(subject=subject.replace("\n", "").replace("\r", ""),
                     body=body,
                     from_email=settings.FROM_EMAIL,
                     to=[sent_from],
                     bcc=settings.EMACS_ADMIN_USER_EMAILS)\
                .send()
