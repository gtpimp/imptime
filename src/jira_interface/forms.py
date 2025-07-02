from django import forms
from .models import Jira, JiraUser
import timepiece.models

class JiraSettingsForm(forms.ModelForm):
    class Meta:
        model = Jira
        exclude=['business']

class JiraUserForm(forms.ModelForm):
    class Meta:
        model = JiraUser
        exclude=['jira', 'timepiece_user']

    def __init__(self, *args, **kwargs):
        super(JiraUserForm, self).__init__(*args, **kwargs)
        self.fields['jira_password'].widget=forms.PasswordInput()

class JiraCreateIssueForm(forms.Form):
    
    project = forms.ChoiceField()
    issue_type = forms.ChoiceField()
    assigned_to = forms.ChoiceField()

    def __init__(self, jira_projects, jira_issue_types, jira_users, *args, **kwargs):
        super(JiraCreateIssueForm, self).__init__(*args, **kwargs)
        self.fields['project'].choices = [ (p.key, "%s %s" % (p.key,p.name)) for p in jira_projects ]
        self.fields['issue_type'].choices = [ (p.name, p.name) for p in jira_issue_types ]
        self.fields['assigned_to'].choices = [ (p.name, p.name) for p in jira_users ]
