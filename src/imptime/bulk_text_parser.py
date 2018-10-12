from emacs_importer.orgnode import makelist_from_file, makelist_from_string
from timepiece.models import Activity, Entry, Location, Attribute, Issue, IssueStatus, IssueComment, IssueAttachment
from timepiece.models import ProjectIssueOrder as SprintIssueOrder
from datetime import datetime
from timepiece.models import IssuePoints
from django.utils import timezone
from django.conf import settings
from testable.models import Testable
from imptime.models import ProjectFeatureOrder, Feature, VisualSpecFeature, VisualSpecDocument, VisualSpecIssue, AnnotatedVisualSpecDocument
from timepiece.models import Project as Sprint
from timepiece.models import ProjectStatus as SprintStatus
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

    def create_features(self, raw_text, project, auto_create_issues_for_leaf_nodes):
        orgnodes = makelist_from_string(raw_text)
        features = []
        running_parents = [Feature.get_root_feature(project.id)]
        previous_feature = None
        running_level = None
        leaf_features = []
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

            for testable in meta_info['testables']:
                testable.project = project
                testable.save()
                testable.features.add(feature)
                testable.save()

            if previous_feature and previous_feature.is_leaf:
                leaf_features.append(previous_feature)

            previous_feature = feature

                
        # last feature inserted is always a leaf
        leaf_features.append(feature)

        if auto_create_issues_for_leaf_nodes:
            self.auto_create_issues_for_leaf_features(project, leaf_features)

        return features
            
    def auto_create_issues_for_leaf_features(self, project, features):
        name="bulk_import_issues_%s" % datetime.now().strftime("%d%b%Y_%H%M")
        sprint = Sprint.objects.create(name=name,
                                       business=project, #sic,
                                       status3=SprintStatus.objects.get_or_create(business_id=project.id,
                                                                                  name='pending')[0],
                                       code=Sprint.get_code_from_name(name))
        for feature in features:
            for testable in feature.testables.all():
                testable_name = testable.name or "Testable %d" % testable.order
                issue = Issue.objects.create(project_id=sprint.id, #sic,
                                             status2 = IssueStatus.objects.get_or_create(name='new', business=sprint.business)[0],
                                             number=Issue.get_next_issue_number(sprint.business),
                                             issue_type="issue",
                                             subject="%s %s" % (feature.name, testable_name),
                                             created_by=self.logged_in_user)

                feature.link_issue_to_testable(self.logged_in_user, issue.id, testable.id)
                SprintIssueOrder.insert_at_the_end(issue)
    
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
            if vsd:
                annotated_vsd = AnnotatedVisualSpecDocument.objects.create(visual_spec_document=vsd)
                VisualSpecIssue.objects.get_or_create(annotated_visual_spec_document=annotated_vsd,
                                                      issue=issue,
                                                      defaults={'order':VisualSpecIssue.get_next_order(issue.id)})
            else:
                logger.warning("No document found with name %s" % meta_info['attributes']["attachment"])
        
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
            if vsd:
               annotated_vsd = AnnotatedVisualSpecDocument.objects.create(visual_spec_document=vsd)
               VisualSpecFeature.objects.get_or_create(annotated_visual_spec_document=annotated_vsd,
                                                       feature=feature,
                                                       defaults={'order':VisualSpecFeature.get_next_order(feature.id)})
            else:
                logger.warning("No document found with name %s" % meta_info['attributes']["attachment"])
        
        return feature
        
        
