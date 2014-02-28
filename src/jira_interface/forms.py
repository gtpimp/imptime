from django import forms
from models import Jira
import timepiece.models

class JiraSettingsForm(forms.ModelForm):
    class Meta:
        model = Jira
        exclude=['business']

    def __init__(self, user, *args, **kwargs):
        super(JiraSettingsForm, self).__init__(*args, **kwargs)
        self.fields['password'].widget=forms.PasswordInput()
        user_ids = []
        for user in self.instance.business.get_users_allowed_to_estimate_on_business(user):
            user_ids.append(user.id)
            
        self.fields['primary_user'].queryset = timepiece.models.User.objects.filter(pk__in=user_ids)


class JiraCreateIssueForm(forms.Form):
    
    project = forms.ChoiceField()
    issue_type = forms.ChoiceField()
    assigned_to = forms.ChoiceField()
    

    def __init__(self, jira_projects, jira_issue_types, jira_users, *args, **kwargs):
        super(JiraCreateIssueForm, self).__init__(*args, **kwargs)
        self.fields['project'].choices = [ (p.key, "%s %s" % (p.key,p.name)) for p in jira_projects ]
        self.fields['issue_type'].choices = [ (p.name, p.name) for p in jira_issue_types ]
        self.fields['assigned_to'].choices = [ (p.name, p.name) for p in jira_users ]

        