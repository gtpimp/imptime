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
    filename = forms.CharField(required=True)
    filecontent = forms.CharField(required=True, widget=forms.Textarea)
    
    def clean_filecontent(self):
        filecontent = self.cleaned_data['filecontent']
        filecontent = base64.b64decode(filecontent)
        return filecontent
    