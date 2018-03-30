import re
from imptime.base_api import PermissionHelper
import json
from timepiece.models import Issue
from markdown_enrichment_serializer import MarkdownEnrichmentSerializer

class MarkdownEnrichment(object):

    issue_pattern = re.compile("`issue(\d*)`")
    imptime_constant = "__imptime__" # must match RenderedMarkdown
    
    def __init__(self, logged_in_user):
        super(MarkdownEnrichment, self).__init__()
        self.logged_in_user = logged_in_user
    
    def enrich(self, s, project_id):
        # Note that the result of this function could be rendered
        # without full access permissions, so any information is
        # pre-fetched.
        enriched = ""
        running_index = 0
        for match in re.finditer(self.issue_pattern, s):
            issue_number = match.group(1)
            start_index, end_index = match.span(0)
            try:
                issue = PermissionHelper().allowed_issues(self.logged_in_user)\
                                          .get(project__business_id=project_id, #sic
                                               number=issue_number)
                inline_issue = {"issue_number":issue_number,
                                "issue_status": issue.status2.name,
                                "issue_subject": issue.subject,
                                "issue_modified": issue.modified,
                                "sprint_name": issue.project.name, #sic
                                "sprint_status": issue.project.status3.name #sic
                                }
            except Issue.DoesNotExist:
                inline_issue = {"issue_number":str(issue_number) + " (not found or permission denied)"}

            data = MarkdownEnrichmentSerializer(inline_issue).data
                
            inline_text = "`" + self.imptime_constant + json.dumps(data) + "`"
            enriched = s[running_index:start_index] + inline_text
            running_index = end_index
            
        enriched += s[running_index:]
            
        return enriched
