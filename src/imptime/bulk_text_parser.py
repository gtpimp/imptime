from emacs_importer.orgnode import makelist_from_file, makelist_from_string
from timepiece.models import Activity, Entry, Location, Attribute, Issue, IssueStatus, IssueComment, IssueAttachment
from timepiece.models import ProjectIssueOrder as SprintIssueOrder
from timepiece.models import IssuePoints
from django.utils import timezone
from django.conf import settings
from testable.models import Testable
from imptime.models import ProjectFeatureOrder, Feature, VisualSpecFeature, VisualSpecDocument, VisualSpecIssue
import logging
import re
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
                description = orgnode.CleanBody()

                meta_info = self.parse_meta_info(description)
                issue = self.create_issue(sprint, subject, meta_info)
                issues.append(issue)
                for testable in meta_info['testables']:
                    testable.issue = issue
                    testable.project = sprint.business #sic
                    testable.save()

                estimate = meta_info['attributes'].get('estimate', None)
                if estimate:
                    estimate = float(estimate)
                    IssuePoints.objects.get_or_create(user=self.logged_in_user,
                                                      issue=issue,
                                                      defaults={'points':estimate})
                    
        return issues

    def create_features(self, raw_text, project):
        orgnodes = makelist_from_string(raw_text)
        features = []
        running_parents = [Feature.get_root_feature(project.id)]
        previous_feature = None
        running_level = None
        for orgnode in orgnodes:
            level = orgnode.Level()
            if running_level is None:
                running_level = level

            name = orgnode.Heading()
            description = orgnode.CleanBody()
            meta_info = self.parse_meta_info(description)

            if previous_feature:
                previous_feature.is_leaf = True
            if level > running_level:
                running_parents.append(previous_feature)
                running_level += 1
                if previous_feature:
                    previous_feature.is_leaf = False
            elif level < running_level:
                running_parents = running_parents[:-1]
                running_level -= 1
            parent = running_parents[-1]
            feature = self.create_feature(project, name, meta_info, parent)
            features.append(feature)
            previous_feature = feature

            for testable in meta_info['testables']:
                testable.project = project
                testable.save()
                testable.features.add(feature)
                testable.save()
        return features
            
    
    def parse_meta_info(self, description):
        description = description.strip()
        description, attributes = self._parse_attributes(description)
        description, testables = self._parse_testables(description)

        return { 'description': description,
                 'attributes': attributes,
                 'testables': testables }
    
    def _parse_testables(self, description):
        groups = re.split("testable:", description, flags=re.IGNORECASE)
        if len(groups) <= 1:
            return description, []
        description = groups[0]
        step_groups = groups[1:]
        order_count = 1
        testables = []
        for step_group in step_groups:
            step_group, meta_info = self._parse_attributes(step_group.strip())
            testables.append(Testable(name=meta_info.get('name', None),
                                      steps=step_group,
                                      order=order_count))
            order_count += 1
        return description, testables

    def _parse_attributes(self, description):
        attribute_names = [ "type", "status", "estimate", "name", "attachment" ]
        attributes = {}
        for i in range(len(attribute_names)):
            for attribute_name in attribute_names:
                attribute_pattern = "{name}: ?([^\n]*)\n".format(name=attribute_name)
                match = re.match(attribute_pattern, description)
                if match:
                    value = match.groups(0)[0].strip()
                    description = description[0:match.start()]+description[match.end():].strip()
                    attributes[attribute_name] = value
        return description, attributes
    
    def create_issue(self, sprint, subject, meta_info):
        issue, is_new = Issue.objects.get_or_create(project=sprint,
                                                    subject=subject,
                                                    defaults={'auto_created_during_import':True,
                                                              'issue_type':meta_info['attributes'].get('type', 'issue'),
                                                              'status2':IssueStatus.objects.get_or_create(name=meta_info['attributes'].get('status', 'new'), business=sprint.business)[0], #sic
                                                              'assigned_to':self.logged_in_user,
                                                              'number':Issue.get_next_issue_number(sprint.business), #sic
                                                              'description':meta_info['description'][0:settings.ISSUE_INBOX_MAX_ISSUE_DESCRIPTION_LENGTH],
                                                              'story_points':0,
                                                              'created':timezone.now(),
                                                              'modified':timezone.now()})
        SprintIssueOrder.insert_at_the_end(issue)

        if "attachment" in meta_info['attributes']:
            attachment_name = meta_info['attributes']["attachment"]
            vsd = VisualSpecDocument.objects.filter(visual_spec_projects__project=sprint.business, #sic
                                                    name=attachment_name).first()
            if not vsd:
                raise Exception("No document found with name %s" % meta_info["attachment"])
            VisualSpecIssue.objects.get_or_create(visual_spec_document=vsd,
                                                    issue=issue,
                                                    defaults={'order':VisualSpecIssue.get_next_order(issue.id)})

        
        logger.debug("Created issue %s %s" % (issue.id, issue.subject))
        return issue

    def create_feature(self, project, name, meta_info, parent):
        feature, is_new = Feature.objects.get_or_create(project=project,
                                                        name=name,
                                                        parent=parent,
                                                        defaults={'number':Feature.get_next_feature_number(project),
                                                                  'description':meta_info['description'],
                                                                  'created':timezone.now(),
                                                                  'modified':timezone.now()})
        ProjectFeatureOrder.insert_at_the_end(feature)

        if "attachment" in meta_info['attributes']:
            attachment_name = meta_info['attributes']["attachment"]
            vsd = VisualSpecDocument.objects.filter(visual_spec_projects__project=project,
                                                    name=attachment_name).first()
            if not vsd:
                raise Exception("No document found with name %s" % meta_info["attachment"])
            VisualSpecFeature.objects.get_or_create(visual_spec_document=vsd,
                                                    feature=feature,
                                                    defaults={'order':VisualSpecFeature.get_next_order(feature.id)})
        
        return feature
        
        
