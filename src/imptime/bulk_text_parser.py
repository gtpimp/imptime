from emacs_importer.orgnode import makelist_from_file, makelist_from_string
from timepiece.models import Activity, Entry, Location, Attribute, Issue, Feature, IssueStatus, IssueComment, IssueAttachment
from django.utils import timezone
from django.conf import settings
import logging
logger = logging.getLogger(__name__)

class BulkTextParser(object):

    def __init__(self, logged_in_user, *args, **kwargs):
        super(BulkTextParser, self).__init__(*args, **kwargs)
        self.logged_in_user = logged_in_user
    
    def create_issues(self, raw_text, sprint):
        orgnodes = makelist_from_string(raw_text)
        issues = []
        for orgnode in orgnodes:
            if orgnode.Level() == 3:
                subject = orgnode.Heading()
                if '|' in subject:
                    feature_name, subject = subject.split('|')
                    feature = Feature.objects.get_or_create(name=feature_name, business=sprint.business)[0] #sic
                else:
                    feature = None
                description = orgnode.CleanBody()

                issues.append(self.create_issue(sprint, subject, description, feature))
        return issues

    def create_issue(self, sprint, subject, description, feature):
        issue, is_new = Issue.objects.get_or_create(project=sprint,
                                                    subject=subject,
                                                    defaults={'auto_created_during_import':True,
                                                              'adhoc':False,
                                                              'status2':IssueStatus.objects.get_or_create(name='new', business=sprint.business)[0], #sic
                                                              'feature':feature,
                                                              'assigned_to':self.logged_in_user,
                                                              'number':Issue.get_next_issue_number(sprint.business), #sic
                                                              'description':description[0:settings.ISSUE_INBOX_MAX_ISSUE_DESCRIPTION_LENGTH],
                                                              'story_points':0,
                                                              'order':Issue.get_next_order(sprint),
                                                              'created':timezone.now(),
                                                              'modified':timezone.now()})

        logger.debug("Created issue %s %s" % (issue.id, issue.subject))
        return issue
