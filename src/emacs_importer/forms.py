from decimal import Decimal
import re
import base64
from django.db.models import Sum, Count, Q, F, Max, Min
import time
from time import mktime
from datetime import datetime
import math
from django.forms.widgets import CheckboxSelectMultiple
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from django import forms
from django.db.models import Q

class ImportTimesheetForm(forms.Form):
    username = forms.CharField(required=True, max_length=50)
    orgfile = forms.FileField(required=True)

    @property
    def filecontent(self):
        return self.cleaned_data['orgfile'].file.read()

    @property
    def filename(self):
        return self.cleaned_data['orgfile'].name
    
    