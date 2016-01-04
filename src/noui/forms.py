from django import forms
from django.forms.models import modelformset_factory
from dateutil.relativedelta import relativedelta
from datetime import datetime
from django.conf import settings
from models import NouiCommand, NouiCommandParameter

class RunCommandForm(forms.Form):
    command = forms.CharField(required=True)

class NouiCommandForm(forms.ModelForm):

    class Meta:
        model = NouiCommand
        exclude = [ 'created', 'modified', 'deleted' ]

class NouiCommandParameterForm(forms.ModelForm):

    class Meta:
        model = NouiCommandParameter
        exclude = [ 'created', 'modified', 'deleted', 'command' ]

command_parameter_formset = modelformset_factory(NouiCommandParameter, form=NouiCommandParameterForm, can_delete=True, extra=1)
