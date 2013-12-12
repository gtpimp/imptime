from django import forms
from models import Jira

class JiraSettingsForm(forms.ModelForm):
    class Meta:
        model = Jira
        exclude=['business']

    def __init__(self, *args, **kwargs):
        super(JiraSettingsForm, self).__init__(*args, **kwargs)
        self.fields['password'].widget=forms.PasswordInput()


class JiraCreateIssueForm(forms.Form):
    
    project = forms.ChoiceField()
    issue_type = forms.ChoiceField()

    def __init__(self, jira_projects, jira_issue_types, *args, **kwargs):
        super(JiraCreateIssueForm, self).__init__(*args, **kwargs)
        self.fields['project'].choices = [ (p.key, "%s %s" % (p.key,p.name)) for p in jira_projects ]
        self.fields['issue_type'].choices = [ (p.name, p.name) for p in jira_issue_types ]

        