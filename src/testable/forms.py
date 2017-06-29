from django import forms
from django.forms.models import modelformset_factory
from invoicing.fields import GroupedModelChoiceField
from dateutil.relativedelta import relativedelta
from datetime import datetime
from django.conf import settings
from testable.models import Testable
from timepiece.models import Feature, IssueStatus, Project

class TestableFilterForm(forms.Form):

    projects = forms.ModelMultipleChoiceField(required=False,
                                              queryset=Project.objects.all().order_by("business__name", "name"),
                                              widget=forms.CheckboxSelectMultiple())
    statuses = forms.ModelMultipleChoiceField(required=False,
                                              queryset=IssueStatus.objects.all().order_by("name"),
                                              widget=forms.CheckboxSelectMultiple())
    features = forms.ModelMultipleChoiceField(required=False,
                                              queryset=Feature.objects.all().order_by("name"),
                                              widget=forms.CheckboxSelectMultiple())
    only_included_in_regression_test = forms.BooleanField(initial=False, required=False)

    def __init__(self, *args, **kwargs):
        self.business = kwargs.pop('business')
        super(TestableFilterForm, self).__init__(*args, **kwargs)

        available_projects = Project.objects.filter(business=self.business).distinct()
        self.fields['projects'].widget.choices = [ ('', 'All') ] + [ (x.id, str(x)) for x in available_projects.order_by("name") ]
        self.fields['projects'].widget.initial = ["",]
        
        available_features = Feature.objects.filter(issues__project__business=self.business).distinct()
        self.fields['features'].widget.choices = [ ('', 'All') ] + [ (x.id, str(x)) for x in available_features.order_by("name") ]
        self.fields['features'].widget.initial = ["",]

        available_statuses = IssueStatus.objects.filter(issues__project__business=self.business).distinct()
        self.fields['statuses'].widget.choices = [ ('', 'All') ] + [ (x.id, str(x)) for x in available_statuses.order_by("name") ]
        self.fields['statuses'].widget.initial = ["",]
        
    def filter(self):
        qs = Testable.objects.filter(issue__project__business=self.business)
        f = self.cleaned_data
        if 'projects' in f and f['projects'].count() > 0:
            qs = qs.filter(issue__project__in=f['projects'])
        if 'statuses' in f and f['statuses'].count() > 0:
            qs = qs.filter(issue__status2__in=f['statuses'])
        if 'features' in f and f['features'].count() > 0:
            qs = qs.filter(issue__feature__in=f['features'])
        if f.get('only_included_in_regression_test', True):
            qs = qs.filter(include_in_regression_test=True)
        return qs.order_by("issue__project__order", "issue__order").distinct()
