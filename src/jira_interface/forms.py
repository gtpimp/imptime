from django import forms
from models import Jira

class JiraSettingsForm(forms.ModelForm):
    class Meta:
        model = Jira
        exclude=['business']

    def __init__(self, *args, **kwargs):
        super(JiraSettingsForm, self).__init__(*args, **kwargs)
        self.fields['password'].widget=forms.PasswordInput()

