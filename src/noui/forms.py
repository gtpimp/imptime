from django import forms
from django.forms.models import modelformset_factory
from dateutil.relativedelta import relativedelta
import json
from datetime import datetime
from django.conf import settings
from .models import NouiCommand, NouiCommandParameter
import logging
logger = logging.getLogger(__name__)

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

class NouiCommandImportForm(forms.Form):
    f = forms.FileField(required=True, label="Command json file")
    
    def save(self):
        j = self.cleaned_data['f'].read()
        data = json.loads(j)

        existing_command = NouiCommand.objects.filter(name=data['name']).first()
        if existing_command:
            existing_command.name = existing_command.name + "_replaced_on_%s" % datetime.today().strftime("%H%M_%d%B%Y")
            existing_command.save()
            logger.info("Command import causing a rename of existing command from %s to %s" % (data['name'], existing_command.name))

        del data['modified']
        del data['created']
        del data['id']

        parameters = data.pop('parameters', [])
        command = NouiCommand.objects.create(**data)

        for parameter in parameters:
            del parameter['id']
            del parameter['command']
            del parameter['created']
            del parameter['modified']
            parameter['command'] = command
            NouiCommandParameter.objects.create(**parameter)

        return command
