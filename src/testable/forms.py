from django import forms
from django.forms.models import modelformset_factory
from invoicing.fields import GroupedModelChoiceField
from dateutil.relativedelta import relativedelta
from django.db.models import Count, Q
from datetime import datetime
from django.conf import settings
from testable.models import Testable, TestableSession, TestableResult
from timepiece.models import Feature, IssueStatus, Project

class TestableFilterForm(forms.Form):

    TEST_EVENT_FILTER_CHOICES = [ ('all', 'All'), ('untested', 'Untested'), ('failed', 'Failed'), ('passed', 'Passed') ]
    
    projects = forms.ModelMultipleChoiceField(required=False,
                                              queryset=Project.objects.none(),
                                              widget=forms.CheckboxSelectMultiple())
    statuses = forms.ModelMultipleChoiceField(required=False,
                                              queryset=IssueStatus.objects.none(),
                                              widget=forms.CheckboxSelectMultiple())
    features = forms.ModelMultipleChoiceField(required=False,
                                              queryset=Feature.objects.none(),
                                              widget=forms.CheckboxSelectMultiple())
    only_included_in_regression_test = forms.BooleanField(initial=False, required=False,
                                                          label="Exclude obsolete testables")

    testable_result_status = forms.ChoiceField(required=False,
                                               choices=[ ("", "All"), ("this_testable_session_only", "All added to this testable session") ] + TestableResult.TESTABLE_RESULT_CHOICES,
                                               label="Test status for this session")


    def __init__(self, *args, **kwargs):
        self.business = kwargs.pop('business')
        super(TestableFilterForm, self).__init__(*args, **kwargs)

        available_projects = Project.objects.filter(business=self.business).distinct()
        self.fields['projects'].queryset = available_projects
        self.fields['projects'].widget.choices = [ ('', 'All') ] + [ (x.id, str(x)) for x in available_projects.order_by("name") ]
        self.fields['projects'].widget.initial = ["",]
        
        available_features = Feature.objects.filter(issues__project__business=self.business).distinct()
        self.fields['features'].queryset = available_features
        self.fields['features'].widget.choices = [ ('', 'All') ] + [ (x.id, str(x)) for x in available_features.order_by("name") ]
        self.fields['features'].widget.initial = ["",]

        available_statuses = IssueStatus.objects.filter(issues__project__business=self.business).distinct()
        self.fields['statuses'].queryset = available_statuses
        self.fields['statuses'].widget.choices = [ ('', 'All') ] + [ (x.id, str(x)) for x in available_statuses.order_by("name") ]
        self.fields['statuses'].widget.initial = ["",]

    def filter(self, testable_session=None):
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
        if 'testable_result_status' in f and f['testable_result_status']:
            status = f['testable_result_status']
            qs = qs.filter(testable_results__testable_session=testable_session)
            if status == 'untested':
                qs = qs.filter(testable_results__status='untested')
            elif status == 'passed':
                qs = qs.filter(testable_results__status='passed')
            elif status == 'failed':
                qs = qs.filter(testable_results__status='failed')
        return qs.order_by("issue__project__order", "issue__order", "order").distinct()

class TestableSessionCreateForm(forms.ModelForm):

    name = forms.CharField(required=False, label="New testable session name")
    
    class Meta:
        model = TestableSession
        fields = ['name']

class TestableSessionSelectForm(forms.Form):
 
    testable_session = forms.ModelChoiceField(required=False,
                                              queryset=TestableSession.objects.none())

    def __init__(self, *args, **kwargs):
        self.business = kwargs.pop('business')
        super(TestableSessionSelectForm, self).__init__(*args, **kwargs)
        available_test_sessions = TestableSession.objects.all().filter(business=self.business).distinct()
        self.fields['testable_session'].queryset = available_test_sessions
        self.fields['testable_session'].widget.choices = [ ('', '---') ] + [ (x.id, str(x)) for x in available_test_sessions.order_by("name") ]
        self.fields['testable_session'].widget.initial = ["",]
