from django.core.management.base import BaseCommand, CommandError
from timepiece.models import Project as Sprint
from django.core.mail import send_mail
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
import imaplib2, time
from threading import Thread, Event
import logging
logger = logging.getLogger(__name__)
import email

class Command(BaseCommand):

    PID_FILENAME = "/tmp/create_issues_from_incoming_email.pid"

    def add_arguments(self, parser):
        parser.add_argument('action', type=str, default="start")
    
    def handle(self, *args, **kwargs):
        if kwargs["action"] == "stop":
            self.stop()
        elif kwargs["action"] == "start":
            self.start()
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
        self.thread = Thread(target=self.idle)
        self.thread.start()
        self.mail_waiting = Event()
        self.inbox = None
        open(self.PID_FILENAME, "w").write(str(os.getpid()))
        
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
        issues_created = []
        for message_number in raw_email_numbers[0].split():
            try:
                try:
                    message = "not set"
                    type, raw_msg = self.inbox.fetch(message_number, '(RFC822)')
                    raw_email_text = raw_msg[0][1]
                    logger.debug("Processing email: %s" % raw_email_text)
                    email_message = email.message_from_string(raw_email_text)
                    logger.debug('Message %s\n%s\n' % (message_number, email_message))
                    message = self.unpack_email(email_message)
                except Exception, ex:
                    logger.exception(ex)
                    send_mail(subject="Problems parsing email: %s" % message_number,
                              message=message,
                              from_email=settings.FROM_EMAIL,
                              recipient_list=settings.EMACS_ADMIN_USER_EMAILS,
                              fail_silently=False)
                    continue

                user_email = message['from']
                
                try:
                    user, project, sprint, default_subject = self.resolve_parts(message)
                    user_email = user.email
                    raw_issues = self.resolve_issue_content(message, default_subject, project)
                    for raw_issue in raw_issues:
                        new_issue = self.create_issue(message, user, project, sprint, raw_issue)
                        logger.debug("Created issue %s %s" % (new_issue.id, new_issue.subject))
                        issues_created.append(new_issue)
                    self.notify_issues_created(user, project, issues_created)
                except Exception, ex:
                    logger.exception(ex)
                    to_addresses = [settings.EMACS_ADMIN_USER_EMAILS, user_email]
                    send_mail(subject="Couldn't create issues from email",
                              message="Failed to process your email. Please resend it \n\n%s\n\n%s" % (ex, str(email_message)),
                              from_email=settings.FROM_EMAIL,
                              recipient_list=to_addresses,
                              fail_silently=False)
            except Exception, ex:
                logger.exception(ex)
                send_mail(subject="Issue creator general error: %s" % message_number,
                          message=str(ex),
                          from_email=settings.FROM_EMAIL,
                          recipient_list=settings.EMACS_ADMIN_USER_EMAILS,
                          fail_silently=True)
            finally:
                self.inbox.store(message_number, '+FLAGS', '\\Deleted')
                self.inbox.expunge()

    def notify_issues_created(self, user, project, issues_created):

        if len(issues_created) == 1:
            subject = "Issue by email for %s: %s" % (project.name, issues_created[0].subject)
        else:
            subject = "%d issues by email for %s" % (len(issues_created), project.name)

        body = ""
        for issue in issues_created:
            body += "#%s %s\n===============\n%s\n\n" % (issue.number, issue.subject, issue.description)
            
        to_addresses = [settings.EMACS_ADMIN_USER_EMAILS, user.email]
        send_mail(subject=subject.replace("\n", "").replace("\r", ""),
                  message=body,
                  from_email=settings.FROM_EMAIL,
                  recipient_list=to_addresses,
                  fail_silently=False)

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
        
        parts = message['subject'].split("/")
        if len(parts) == 2:
            project_name = parts[0]
            subject = parts[1]
        else:
            project_name = parts[0]
            subject = None

        project_name = project_name.strip().lower()
        project = Project.objects.filter(name__iexact=project_name)\
                                 .filter_by_logged_in_user(user)\
                                 .first()
        if project is None:
            raise Exception("No project found with name %s" % project_name)

        sprint_name = settings.ISSUE_INBOX_DEFAULT_SPRINT_NAME

        sprint = Sprint.objects.filter(business=project,
                                       name=sprint_name,
                                       project_type='inbox')\
                               .filter_open()\
                               .order_by("-id")\
                               .first()
        if sprint is None:
            sprint = Sprint.objects.get_or_create(business=project,
                                                  name=sprint_name,
                                                  defaults={'status3': SprintStatus.objects.get_or_create(name='pending',
                                                                                                          business=project)[0],
                                                            'project_type': 'inbox',
                                                            'description': "For incoming unprocessed issues"})[0]
        return user, project, sprint, subject
        

    def resolve_issue_content(self, message, default_subject, project):
        content = message['content']
        raw_issues = []
        if '***' in content:
            orgnodes = makelist_from_string(content)
            for orgnode in orgnodes:
                if orgnode.Level() == 3:
                    subject = orgnode.Heading()
                    description = orgnode.CleanBody()
                    raw_issues.append({'subject': subject,
                                       'description': description,
                                       })
        else:
            content = content or ''
            raw_issues.append({'subject': default_subject or content[0:20],
                               'description': content,
                               })
        return raw_issues
    
    def get_user(self, message):
        user = User.objects.filter(email=message['from']).first()
        if user is None:
            raise Exception("No user found with email %s" % message['from'])
        if not user.is_active:
            raise Exception("User is not active")
        return user

    def create_issue(self, message, user, project, sprint, raw_issue):
        issue = Issue.objects.filter(project=sprint, subject=raw_issue['subject'])\
                             .order_by_project_id(project.id, descending=True)\
                             .first()
        if issue is None:
            issue = Issue.objects.create(project=sprint,
                                         subject=raw_issue['subject'],
                                         auto_created_during_import=True,
                                         issue_type='correspondence',
                                         status2=IssueStatus.objects.get_or_create(name='new', business=project)[0],
                                         assigned_to=user,
                                         number=Issue.get_next_issue_number(project),
                                         description=raw_issue['description'][0:settings.ISSUE_INBOX_MAX_ISSUE_DESCRIPTION_LENGTH],
                                         story_points=0,
                                         created=message['time'],
                                         modified=message['time'])
            SprintIssueOrder.insert_at_the_end(issue)
        else:
            IssueComment.objects.create(issue=issue,
                                        comment=raw_issue['description'],
                                        author=user,
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
            
        logger.info("Created issue %s for %s by email" % (issue.id, user.username))
        return issue
