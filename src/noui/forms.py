from django import forms
from invoicing import models
from django.forms.models import modelformset_factory
from invoicing.fields import GroupedModelChoiceField
from dateutil.relativedelta import relativedelta
from datetime import datetime
from django.conf import settings
from timepiece import models as timepiece

class CommandForm(forms.Form):

    command = forms.CharField(required=True)
