from decimal import Decimal
import re
from django.utils.functional import curry
from django.db.models import Sum, Count, Q, F, Max, Min
from django.contrib.auth.models import Group
import time
from time import mktime
from datetime import datetime
import math
from django.forms.widgets import CheckboxSelectMultiple
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from django import forms
from django.db.models import Q
from django.conf import settings
from django.forms.models import inlineformset_factory, modelformset_factory

from django.contrib.auth import models as auth_models
from django.contrib.auth import forms as auth_forms
from django.core.urlresolvers import reverse
from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import ValidationError, NON_FIELD_ERRORS

from selectable import forms as selectable_forms

from timepiece.lookups import ProjectLookup, QuickLookup
from timepiece.lookups import UserLookup, BusinessLookup

from timepiece.models import Project, Business, Entry, Activity, UserProfile, Attribute, Location, Activity, Issue, IssueStatus, BusinessPermissions, BusinessComment, Company
from timepiece.models import ProjectHours, Salary, CalendarEvent, TrafficChecklist, DevChecklist, FinanceChecklist, Schedule
from timepiece.fields import UserModelChoiceField
from django.contrib.auth.models import User
from timepiece import models as timepiece
from timepiece import utils
from invoicing.fields import GroupedModelChoiceField

class ProjectFiltersForm(forms.Form):
    TRUNC_CHOICES = [
        ('day', 'Day'),
        ('week', 'Week'),
        ('month', 'Month'),
    ]
    DEFAULT_TRUNC = TRUNC_CHOICES[1][0]
    billable = forms.BooleanField(initial=True, required=False)
    non_billable = forms.BooleanField(label='Non-Billable', initial=True,
                                      required=False)
    paid_leave = forms.BooleanField(initial=True, required=False)
    trunc = forms.ChoiceField(label='Group Totals By:', choices=TRUNC_CHOICES,
                              widget=forms.RadioSelect(), required=False,
                              initial=DEFAULT_TRUNC)
    pj_select = selectable_forms.AutoCompleteSelectMultipleField(ProjectLookup,
        label='Project Name:', required=False)

    def clean_trunc(self):
        trunc = self.cleaned_data.get('trunc', '')
        if not trunc:
            trunc = self.DEFAULT_TRUNC
        return trunc

    def get_hour_type(self):
        try:
            billable = self.cleaned_data.get('billable', False)
            non_billable = self.cleaned_data.get('non_billable', False)
        except AttributeError:
            return 'total'
        if billable and non_billable:
            return 'total'
        elif billable:
            return 'billable'
        elif non_billable:
            return 'non_billable'
        return 'nothing'


class CreatePersonForm(auth_forms.UserCreationForm):

    class Meta:
        model = auth_models.User
        fields = (
            "username", "first_name", "last_name",
            "email", "is_active", "is_staff"
        )


class EditPersonForm(auth_forms.UserChangeForm):
    password_one = forms.CharField(required=False, max_length=36,
        label=_(u'Password'), widget=forms.PasswordInput(render_value=False))
    password_two = forms.CharField(required=False, max_length=36,
        label=_(u'Repeat Password'),
        widget=forms.PasswordInput(render_value=False))

    class Meta:
        model = auth_models.User
        fields = ('username', 'first_name', 'last_name', 'email', 'is_active', 'is_staff')


    def __init__(self, *args, **kwargs):
        super(EditPersonForm, self).__init__(*args, **kwargs)

        # In 1.4 this field is created even if it is excluded in Meta.
        if 'password' in self.fields:
            del(self.fields['password'])

    def clean_password(self):
        return self.cleaned_data.get('password_one', None)

    def clean(self):
        super(EditPersonForm, self).clean()
        password_one = self.cleaned_data.get('password_one', None)
        password_two = self.cleaned_data.get('password_two', None)
        if password_one and password_one != password_two:
            raise forms.ValidationError(_('Passwords Must Match.'))
        return self.cleaned_data

    def save(self, *args, **kwargs):
        commit = kwargs.get('commit', True)
        kwargs['commit'] = False
        instance = super(EditPersonForm, self).save(*args, **kwargs)
        password_one = self.cleaned_data.get('password_one', None)
        if password_one:
            instance.set_password(password_one)
        if commit:
            instance.save()
        return instance


class EditPersonPermission(forms.ModelForm):
    class Meta:
        model = timepiece.BusinessPermissions
        exclude = ( 'user', 'business', 'created', 'modified' )

    def __init__(self, *args, **kwargs):
        super(EditPersonPermission, self).__init__(*args, **kwargs)

        self.fields['can_view_project_card'].widget.attrs['class'] = 'safe'
        self.fields['can_edit_issues'].widget.attrs['class'] = 'safe'
        self.fields['can_view_issues'].widget.attrs['class'] = 'safe'
        self.fields['can_add_issue'].widget.attrs['class'] = 'safe'
        self.fields['can_delete_issue'].widget.attrs['class'] = 'safe'
        self.fields['can_edit_description'].widget.attrs['class'] = 'safe'
        self.fields['can_add_issue_comment'].widget.attrs['class'] = 'safe'
        self.fields['can_edit_subject'].widget.attrs['class'] = 'safe'
        self.fields['can_edit_feature'].widget.attrs['class'] = 'safe'
        self.fields['can_edit_tags'].widget.attrs['class'] = 'safe'
        self.fields['can_create_sprint'].widget.attrs['class'] = 'safe'
        self.fields['can_edit_issue_states'].widget.attrs['class'] = 'safe'
        self.fields['can_edit_project_states'].widget.attrs['class'] = 'safe'
        self.fields['can_assign_user'].widget.attrs['class'] = 'safe'
        self.fields['can_be_scheduled'].widget.attrs['class'] = 'safe'
        self.fields['can_view_business_comments'].widget.attrs['class'] = 'safe'
        self.fields['can_view_testables'].widget.attrs['class'] = 'safe'

        self.fields['can_view_actual_hours'].widget.attrs['class'] = 'safe'
        self.fields['can_share_issues'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_estimate_own_points'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_see_other_user_points'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_view_calendar'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_import_actual_hours'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_edit_business_comments'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_do_dev_checklist'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_do_traffic_checklist'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_do_finance_checklist'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_edit_sprint_status'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_edit_sprint_type'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_delete_project'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_view_velocity'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_edit_velocity'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_view_issue_history'].widget.attrs['class'] = 'medium-safe'
        self.fields['can_edit_old_clock_entries'].widget.attrs['class'] = 'medium-safe'
        
        self.fields['can_view_permissions'].widget.attrs['class'] = 'unsafe'
        self.fields['can_view_review_cycle'].widget.attrs['class'] = 'unsafe'
        self.fields['is_active_member_of_business'].widget.attrs['class'] = 'unsafe'
        self.fields['can_invite_users'].widget.attrs['class'] = 'unsafe'
        self.fields['can_set_user_permissions'].widget.attrs['class'] = 'unsafe'
        self.fields['can_edit_permissions'].widget.attrs['class'] = 'unsafe'
        self.fields['can_toggle_graphs'].widget.attrs['class'] = 'unsafe'
        self.fields['can_edit_project_detail'].widget.attrs['class'] = 'unsafe'
        self.fields['can_edit_budget'].widget.attrs['class'] = 'unsafe'
        self.fields['can_view_budget'].widget.attrs['class'] = 'unsafe'
        self.fields['can_edit_invoices'].widget.attrs['class'] = 'unsafe'
        self.fields['can_view_invoices'].widget.attrs['class'] = 'unsafe'
        self.fields['can_edit_ctc_billable_rates'].widget.attrs['class'] = 'unsafe'
        self.fields['can_view_ctc_billable_rates'].widget.attrs['class'] = 'unsafe'
        self.fields['can_view_ctc_rates'].widget.attrs['class'] = 'unsafe'
        self.fields['can_view_documents'].widget.attrs['class'] = 'unsafe'
        self.fields['can_edit_calendar'].widget.attrs['class'] = 'unsafe'
        self.fields['can_edit_review_cycle'].widget.attrs['class'] = 'unsafe'

class QuickEditPersonForm(forms.ModelForm):
    class Meta:
        model = auth_models.User
        fields = ["first_name", "last_name"]

class QuickSearchForm(forms.Form):
    quick_search = selectable_forms.AutoCompleteSelectField(
        QuickLookup,
        label='Quick Search',
        required=False
    )
    quick_search.widget.attrs['placeholder'] = 'Search'

    def clean_quick_search(self):
        item = self.cleaned_data['quick_search']

        if item is not None:
            try:
                item = item.split('-')
                if len(item) == 1 or '' in item:
                    raise ValueError
                return item
            except ValueError:
                raise forms.ValidationError('%s' %
                    'User, business, or project does not exist')
        else:
            raise forms.ValidationError('%s' %
                'User, business, or project does not exist')

    def save(self):
        type, pk = self.cleaned_data['quick_search']

        if type == 'individual':
            return reverse('view_person', kwargs={
                'person_id': pk
            })
        elif type == 'business':
            return reverse('view_business', kwargs={
                'business': pk
            })
        elif type == 'project':
            return reverse('view_project', kwargs={
                'project_id': pk
            })

        raise forms.ValidationError('Must be a user, project, or business')


class AddUserToProjectForm(forms.Form):
    user = selectable_forms.AutoCompleteSelectField(UserLookup, label="")
    user.widget.attrs['placeholder'] = 'Add User'

    def save(self):
        return self.cleaned_data['user']

class AssignUserToIssueForm(forms.Form):
    user = forms.ModelChoiceField(required=False, label='User:',
                                  queryset=auth_models.User.objects.order_by("username"))
    user.widget.attrs['placeholder'] = 'Add User'

    def __init__(self, *args, **kwargs):
        if 'business' in kwargs:
            business = kwargs.pop('business')
        else:
            business = None
        super(AssignUserToIssueForm, self).__init__(*args, **kwargs)

        if business is not None:
            self.fields['user'].widget.choices = [ ('', '') ] + [ (x.id, str(x)) for x in business.users.order_by("username") ]

    def save(self):
        return self.cleaned_data['user']

class ClockInForm(forms.ModelForm):
    active_comment = forms.CharField(label='Notes for the active entry',
                                     widget=forms.Textarea, required=False)

    class Meta:
        model = timepiece.Entry
        fields = (
            'active_comment', 'location', 'issue', 'activity', 'start_time',
            'comments'
        )

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user')
        self.active = kwargs.pop('active', None)
        initial = kwargs.get('initial', {})
        default_loc = getattr(
            settings,
            'TIMEPIECE_DEFAULT_LOCATION_SLUG',
            None,
        )
        if default_loc:
            try:
                loc = timepiece.Location.objects.get(slug=default_loc)
            except timepiece.Location.DoesNotExist:
                loc = None
            if loc:
                initial['location'] = loc.pk
        project = initial.get('project')
        try:
            last_project_entry = timepiece.Entry.objects.filter(
                user=self.user, issue__project=project).order_by('-end_time')[0]
        except IndexError:
            initial['activity'] = None
        else:
            initial['activity'] = last_project_entry.activity.id
        super(ClockInForm, self).__init__(*args, **kwargs)
        self.fields['start_time'].required = False
        self.fields['start_time'].initial = datetime.now()
        self.fields['start_time'].widget = forms.SplitDateTimeWidget(
            attrs={'class': 'timepiece-time'},
            date_format='%m/%d/%Y',
        )
        projects = timepiece.Project.objects.filter(
            users=self.user, status__enable_timetracking=True,
            type__enable_timetracking=True
            )

        if not self.user.is_superuser:
            projects = projects.filter(users=self.user)
        self.fields['project'].queryset = projects
        if not self.active:
            self.fields.pop('active_comment')
        else:
            self.fields['active_comment'].initial = self.active.comments
        self.instance.user = self.user

    def clean_start_time(self):
        """
        Make sure that the start time doesn't come before the active entry
        """
        start = self.cleaned_data.get('start_time')
        if not start:
            return start
        active_entries = self.user.timepiece_entries.filter(
            start_time__gte=start, end_time__isnull=True)
        for entry in active_entries:
            output = 'The start time is on or before the current entry: ' + \
            '%s - %s starting at %s' % (entry.issue.project, entry.activity,
                entry.start_time.strftime('%H:%M:%S'))
            raise forms.ValidationError(output)
        return start

    def clean(self):
        start_time = self.clean_start_time()
        data = self.cleaned_data
        if not start_time:
            return data
        if self.active:
            self.active.unpause()
            self.active.comments = data['active_comment']
            self.active.end_time = start_time - timedelta(seconds=1)
            if not self.active.clean():
                raise forms.ValidationError(data)
        return data

    def save(self, commit=True):
        entry = super(ClockInForm, self).save(commit=False)
        entry.hours = 0
        entry.clock_in(self.user, self.cleaned_data['project'])
        if commit:
            entry.save()
            if self.active:
                self.active.save()
        return entry


class ClockOutForm(forms.ModelForm):
    class Meta:
        model = timepiece.Entry
        fields = ('location', 'comments', 'start_time', 'end_time')

    def __init__(self, *args, **kwargs):
        kwargs['initial'] = {'end_time': datetime.now()}
        super(ClockOutForm, self).__init__(*args, **kwargs)
        self.fields['start_time'] = forms.DateTimeField(
            widget=forms.SplitDateTimeWidget(
                attrs={'class': 'timepiece-time'},
                date_format='%m/%d/%Y',
            )

        )
        self.fields['end_time'] = forms.DateTimeField(
            widget=forms.SplitDateTimeWidget(
                attrs={'class': 'timepiece-time'},
                date_format='%m/%d/%Y',
            ),
        )

        self.fields.keyOrder = ('location', 'start_time',
            'end_time', 'comments')

    def save(self, commit=True):
        entry = super(ClockOutForm, self).save(commit=False)
        entry.end_time = self.cleaned_data['end_time']
        entry.unpause(date=self.cleaned_data['end_time'])
        if commit:
            entry.save()
        return entry

class ImportEntriesForm(forms.Form):
    raw_entries = forms.CharField(max_length=50000, required=False, widget=forms.Textarea)

    def __init__(self, user, *args, **kwargs):
        super(ImportEntriesForm, self).__init__(*args, **kwargs)
        self.user = user

    def _ignore_project(self, entry):
        ignore_projects_names = []
        try:
            ignore_projects_names = self.user.profile.project_names_to_ignore
            ignore_projects_names = ignore_projects_names.split(',')
        except auth_models.User.DoesNotExist:
            # If no user profile, then nothing to ignore.
            return False


        entry_list = entry.split('\t')
        project_name = entry_list[1] if len(entry_list) > 1 else None
        if project_name is None:
            return False
        project_code = Project.get_code_from_name(project_name)

        ignore_projects_codes = [ Project.get_code_from_name(name) for name in ignore_projects_names ]
        if project_code in ignore_projects_codes:
            return True

        return False

    def save(self):
        raw_entries = self.cleaned_data['raw_entries'].replace("\r\n", "\n")
        entries = []

        errors = []

        count = 0
        num_entries_updated = 0
        num_entries_created = 0
        line_number = 0
        total_hours = 0

        for raw_entry in raw_entries.split("\n"):
            line_number += 1
            if len(raw_entry.strip())==0:
                continue

            if self._ignore_project(raw_entry):
                continue;

            count += 1

            try:
                raw_entry = raw_entry.replace("|", "\t")
                raw_date, raw_business, raw_project, raw_issue_number, raw_description, raw_hours = raw_entry.split("\t")
            except ValueError, ex:
                errors.append( {'line':raw_entry,
                                'line_number':line_number,
                                'error':"Invalid line format: %s",
                                'msg': str(ex)} )
                continue
            try:
                date = datetime.fromtimestamp(mktime(time.strptime(raw_date, "%d-%b-%y")))
            except ValueError:
                errors.append( {'line':raw_entry,
                                'line_number':line_number,
                                'error':"Invalid date format for %s" % raw_date,
                                'msg': "Should be in format Day-MonthName-Year, eg 31-Jan-13"} )
                continue
            try:
                business = Business.objects.get(name=raw_business)
            except Business.DoesNotExist, ex:
                try:
                    business = Business.objects.get(name__iexact=raw_business)
                except:
                    allowed_businesses = BusinessPermissions.active_businesses_for_user(self.user)
                    errors.append( {'line':raw_entry,
                                    'line_number':line_number,
                                    'error':"Invalid business name %s" % raw_business,
                                    'msg': "Are you assigned to this business? Possible businesses are: %s" % (", ".join([b.name for b in allowed_businesses]))
                                    } )
                    continue

            try:
                allowed_projects = Project.objects.filter(business=business).filter_by_logged_in_user(self.user)
                project = allowed_projects.get(name=raw_project)
            except Project.DoesNotExist, ex:
                try:
                    project = allowed_projects.get(name=lookup_project(raw_project, (p.name for p in allowed_projects)))
                except LookupError, ex:
                    errors.append( {'line':raw_entry,
                                    'line_number':line_number,
                                    'error':"Invalid sprint name %s" % raw_project,
                                    'msg': "Are you assigned to this sprint? Possible sprints are: %s" % (", ".join([p.name for p in allowed_projects]))
                                    })
                    continue

            if raw_issue_number.strip():
                try:
                    issue = project.issues.get(number=raw_issue_number)
                except Issue.DoesNotExist:
                    errors.append( {'line':raw_entry,
                                    'line_number':line_number,
                                    'error':"Invalid issue number %s" % raw_issue_number,
                                    'msg': "Possible issue numbers are: %s" % (", ".join([str(i.number) for i in project.issues.all().order_by("order")]))
                                    })
                    continue
            else:
                issue = None

            description = raw_description
            try:
                hours, minutes = parse_hours_raw(raw_hours)
            except ValueError:
                errors.append( {'line':raw_entry,
                                'line_number':line_number,
                                'error':"Invalid hours value %s for sprint name %s." % (raw_hours, raw_project),
                                'msg':"Invalid hours value '%s' for sprint name %s. Please check the value." % (raw_hours, raw_project)
                                })
                continue

            start_time = datetime(date.year, date.month, date.day)
            end_time = datetime(start_time.year, start_time.month, start_time.day, int(round(start_time.hour+hours)), int(round(start_time.minute+minutes)))

            total_hours += hours + float(minutes)/60

            entry = Entry(user=self.user, project=project, comments=description, start_time=start_time, end_time=end_time)
            num_entries_created += 1
            entry.issue = issue
            tidy_entry(entry)
            entry.save()
            entries.append(entry)

        return {'entries':entries,
                'errors': errors,
                'count': count,
                'total_hours':total_hours,
                'num_entries_updated': num_entries_updated,
                'num_entries_created': num_entries_created}

class AddUpdateEntryForm(forms.Form):
    """
    This form will provide a way for users to add missed log entries and to
    update existing log entries.
    """

    # start_time = forms.DateTimeField(
    #     widget=forms.SplitDateTimeWidget(
    #         attrs={'class': 'timepiece-time'},
    #         date_format='%m/%d/%Y',
    #     )
    # )
    # end_time = forms.DateTimeField(
    #     widget=forms.SplitDateTimeWidget(
    #         attrs={'class': 'timepiece-time'},
    #         date_format='%m/%d/%Y',
    #     )
    # )

    project = forms.ChoiceField()
    issue_number = forms.CharField(required=True)
    date = forms.DateField(required=True)
    hours = forms.CharField(required=True)
    comments = forms.CharField(max_length=1000, required=False, widget=forms.Textarea)

    class Meta:
        model = Entry
        exclude = ('user', 'pause_time', 'site', 'hours', 'status', 'activity', 'location', 'start_time', 'end_time', 'seconds_paused', 'comments',
                   'entry_group')

    def __init__(self, *args, **kwargs):
        self.instance = kwargs.pop('instance')
        self.user = kwargs.pop('user')
        super(AddUpdateEntryForm, self).__init__(*args, **kwargs)
        self.fields['project'].choices = ( (p.id, p.long_name()) for p in timepiece.Project.objects.filter(
            users=self.user, status__enable_timetracking=True,
            type__enable_timetracking=True).filter(Q(status__label="open")|Q(status__label="reopened")).order_by("business__name", "name") )

        if self.instance:
            self.fields['comments'].initial = self.instance.comments
            self.fields['issue_number'].initial = self.instance.issue.number
            self.fields['project'].initial = self.instance.project.id

        #if editing a current entry, remove the end time field
        #if self.instance is not NOneself.instance.start_time and not self.instance.end_time:
        #    self.fields.pop('end_time')

        self.fields['date'].initial = self.instance.start_time if self.instance else None
        self.fields['hours'].initial = self.instance.hours if self.instance else None

    def clean(self):

        cleaned_data = self.cleaned_data

        start_date = cleaned_data.get('date', None)

        hours_raw = cleaned_data.get('hours', "0")
        hours, minutes = parse_hours_raw(hours_raw)
        start = datetime(start_date.year, start_date.month, start_date.day)
        end = datetime(start.year, start.month, start.day, int(round(start.hour+hours)), int(round(start.minute+minutes)))

        cleaned_data['start_time'] = start
        cleaned_data['end_time'] = end

        #start = cleaned_data.get('start_time', None)
        #end = cleaned_data.get('end_time', None)
        if not start:
            raise forms.ValidationError(
                'Please enter a valid date/time.')
        #Obtain all current entries, except the one being edited
        # times = [start, end] if end else [start]
        # query = reduce(lambda q, time: q | Q(start_time__lte=time), times, Q())
        # entries = self.user.timepiece_entries.filter(
        #     query, end_time__isnull=True
        #     ).exclude(id=self.instance.id if self.instance else None)
        # for entry in entries:
        #     output = 'The times below conflict with the current entry: ' + \
        #     '%s - %s starting at %s' % \
        #     (entry.issue.project, entry.activity,
        #         entry.start_time.strftime('%H:%M:%S'))
        #     raise forms.ValidationError(output)

        project = timepiece.Project.objects.get(pk=cleaned_data['project'])
        issue_number = self.cleaned_data['issue_number']
        if issue_number.strip():
            try:
                project.issues.get(number=issue_number.strip())
            except timepiece.Issue.DoesNotExist:
                raise forms.ValidationError('Please enter a valid issue number', code="issue_number")

        return self.cleaned_data

    def save(self, commit=True):

        if self.instance is None:
            self.instance = Entry()

        self.instance.start_time = self.cleaned_data['start_time']
        self.instance.end_time = self.cleaned_data['end_time']
        project = Project.objects.get(pk=int(self.cleaned_data['project']))
        self.instance.user = self.user
        self.instance.comments = self.cleaned_data['comments']
        if self.cleaned_data['issue_number'].strip():
            self.instance.issue = project.issues.get(number=self.cleaned_data['issue_number'].strip())

        tidy_entry(self.instance)
        self.instance.save()
        return self.instance

def tidy_entry(entry):
    entry.activity = Activity.objects.get_or_create(code='dev')[0]
    entry.location = Location.objects.get_or_create(name='office')[0]
    entry.status = 'approved'
    entry.seconds_paused = 0
    entry.pause_time = None

STATUS_CHOICES = [('', '---------'), ]
STATUS_CHOICES.extend(timepiece.ENTRY_STATUS)

class DateForm(forms.Form):
    DATE_FORMAT = '%m/%d/%Y'

    from_date = forms.DateField(label="From", required=False,
        input_formats=(DATE_FORMAT,),
        widget=forms.DateInput(format=DATE_FORMAT))
    to_date = forms.DateField(label="To", required=False,
         input_formats=(DATE_FORMAT,),
         widget=forms.DateInput(format=DATE_FORMAT))
    status = forms.ChoiceField(choices=STATUS_CHOICES,
         widget=forms.HiddenInput(), required=False)
    activity = forms.ModelChoiceField(
         queryset=timepiece.Activity.objects.all(),
         widget=forms.HiddenInput(), required=False,
     )
    project = forms.ModelChoiceField(
         queryset=timepiece.Project.objects.all(),
         widget=forms.HiddenInput(), required=False,
    )

    def clean(self):
        cleaned_data = super(DateForm, self).clean()
        data = self.cleaned_data
        data['from_date'] = data.get('from_date', None)
        data['to_date'] = data.get('to_date', None)
        if data['from_date'] and data['to_date'] and data['from_date'] > data['to_date']:
            err_msg = 'The ending date must exceed the beginning date.'
            raise ValidationError(err_msg)
        return data

    def save(self):
        from_date = self.cleaned_data.get('from_date', '')
        to_date = self.cleaned_data.get('to_date', '')

        if to_date:
            to_date += timedelta(days=1)
        return (from_date, to_date)


class DateOnlyForm(forms.Form):
    DATE_FORMAT = '%m/%d/%Y'

    from_date = forms.DateField(label="From", required=False,
        input_formats=(DATE_FORMAT,),
        widget=forms.DateInput(format=DATE_FORMAT))
    to_date = forms.DateField(label="To", required=False,
         input_formats=(DATE_FORMAT,),
         widget=forms.DateInput(format=DATE_FORMAT))

    def clean(self):
        cleaned_data = super(DateOnlyForm, self).clean()
        data = self.cleaned_data
        data['from_date'] = data.get('from_date', None)
        data['to_date'] = data.get('to_date', None)
        if data['from_date'] and data['to_date'] and data['from_date'] > data['to_date']:
            err_msg = 'The ending date must exceed the beginning date.'
            raise ValidationError(err_msg)
        return data

    def save(self):
        from_date = self.cleaned_data.get('from_date', '')
        to_date = self.cleaned_data.get('to_date', '')

        if to_date:
            to_date += timedelta(days=1)
        return (from_date, to_date)


class YearMonthForm(forms.Form):
    MONTH_CHOICES = [(i, time.strftime('%B', time.strptime(str(i), '%m'))) \
                     for i in xrange(1, 13)]
    month = forms.ChoiceField(choices=MONTH_CHOICES, label='')
    year = forms.ChoiceField(label='')

    def __init__(self, *args, **kwargs):
        allow_any = kwargs.pop('allow_any', False)
        super(YearMonthForm, self).__init__(*args, **kwargs)

        if allow_any:
            self.fields.insert(0, 'select_all', forms.ChoiceField(label='', choices=(('all', 'Select All Entries'), ('month', 'Specific month')), initial='all'))

        now = datetime.now()
        this_year = now.year
        this_month = now.month
        try:
            first_entry = timepiece.Entry.objects_original.values('end_time').order_by('end_time')[0]
        except IndexError:
            first_year = this_year
        else:
            first_year = first_entry['end_time'].year
        years = [(year, year) for year in xrange(first_year, this_year + 1)]
        self.fields['year'].choices = years
        initial = kwargs.get('initial')
        if initial:
            this_year = initial.get('year', this_year)
            this_month = initial.get('month', this_month)
        self.fields['year'].initial = this_year
        self.fields['month'].initial = this_month

    def save(self):
        now = datetime.now()
        this_year = now.year
        this_month = now.month
        month = int(self.cleaned_data.get('month', this_month))
        year = int(self.cleaned_data.get('year', this_year))
        from_date = datetime(year, month, 1)
        to_date = from_date + relativedelta(months=1)

        if 'select_all' in self.cleaned_data and self.cleaned_data.get('select_all') == 'all':
            return ( None, None )
        else:
            return (from_date, to_date)


class UserYearMonthForm(YearMonthForm):
    users = auth_models.User.objects.exclude(timepiece_entries=None).order_by('first_name')
    user = UserModelChoiceField(label='', queryset=users, required=False)

    def save(self):
        from_date, to_date = super(UserYearMonthForm, self).save()
        return  (from_date, to_date, self.cleaned_data.get('user', None))


class ProjectionForm(DateForm):
    user = forms.ModelChoiceField(queryset=None)

    def __init__(self, *args, **kwargs):
        users = kwargs.pop('users')
        super(ProjectionForm, self).__init__(*args, **kwargs)
        self.fields['user'].queryset = users


class BusinessForm(forms.ModelForm):
    class Meta:
        model = timepiece.Business
        fields = ('name', 'email', 'description', 'invoice_method', 'notes', 'sync_with', 'point_person', 'archived')
        exclude = ['impd_client','point_person']

    def save(self, impd_client):
        instance = super(BusinessForm, self).save(commit=False)
        instance.impd_client = impd_client
        instance.save()
        return instance

class AddUserToBusinessForm(forms.Form):
    point_person = selectable_forms.AutoCompleteSelectField(UserLookup, label="")
    point_person.widget.attrs['placeholder'] = 'Add User'

    def save(self):
        return self.cleaned_data['point_person']


class ProjectForm(forms.ModelForm):
    class Meta:
        model = timepiece.Project
        fields = (
            'name',
            'short_description',
            'description',
            #'colour',
            'ratio_management',
            'ratio_testing',
            'ratio_scope_creep',
            'commission_percentage',
        )

    # business = selectable_forms.AutoCompleteSelectField(
    #     BusinessLookup,
    #     label='Business',
    #     required=True
    # )
    # business.widget.attrs['placeholder'] = 'Search'

    def __init__(self, bp, *args, **kwargs):
        super(ProjectForm, self).__init__(*args, **kwargs)
        self.bp = bp
        if not self.bp.can_view_ctc_billable_rates:
            del self.fields['ratio_management']
            del self.fields['ratio_testing']
            del self.fields['ratio_scope_creep']
            del self.fields['commission_percentage']

    def save(self):
        instance = super(ProjectForm, self).save(commit=False)
        instance.save()
        return instance


class NewProjectForm(forms.ModelForm):
    budget = forms.FloatField(required=False)
    class Meta:
        model = timepiece.Project
        fields = (
            'name',
            'short_description',
            'description'
        )

    def __init__(self, *args, **kwargs):
        super(NewProjectForm, self).__init__(*args, **kwargs)

    def save(self, commit=False):
        instance = super(NewProjectForm, self).save(commit=commit)
        return instance

class ProjectBudgetForm(forms.ModelForm):
    class Meta:
        model = timepiece.Project
        fields = (
            'budget',
        )

class ProjectDeadlineForm(forms.ModelForm):
    class Meta:
        model = timepiece.Project
        fields = (
            'start_dev_at', 'start_internal_qa_at', 'start_client_qa_at', 'invoice_at'
        )

    def __init__(self, *args, **kwargs):
        super(ProjectDeadlineForm, self).__init__(*args, **kwargs)
        self.fields['start_dev_at'].widget.attrs['class'] = 'datepicker'
        self.fields['start_internal_qa_at'].widget.attrs['class'] = 'datepicker'
        self.fields['start_client_qa_at'].widget.attrs['class'] = 'datepicker'
        self.fields['invoice_at'].widget.attrs['class'] = 'datepicker'

class IssueStatusForm(forms.ModelForm):

    class Meta:
        model = timepiece.Issue
        fields = (
            'status2',
        )

    def __init__(self, business, *args, **kwargs):
        super(IssueStatusForm, self).__init__(*args, **kwargs)
        self.fields['status2'].queryset = IssueStatus.objects.filter(business=business).order_by("name")

class IssueNumberForm(forms.ModelForm):
    class Meta:
        model = timepiece.Issue
        fields = ('number',)

class IssueForm(forms.ModelForm):

    estimated_hours = forms.FloatField(required=False, initial=0)

    class Meta:
        model = timepiece.Issue
        fields = (
            'subject',
            'description',
            'status2',
            'assigned_to'
            )

    def __init__(self, *args, **kwargs):
        if 'business' in kwargs:
            business = kwargs.pop('business')
        else:
            business = None
        super(IssueForm, self).__init__(*args, **kwargs)
        self.fields['subject'].widget = forms.TextInput()
        self.fields['subject'].required = False

        self.fields['status2'].queryset = IssueStatus.objects.filter(business=business).order_by('name')

        if business is not None:
            self.fields['status2'].initial = IssueStatus.objects.get_or_create(business=business, name='new')[0]
            self.fields['assigned_to'].widget.choices = [('', '')] + [(x.id, str(x)) for x in business.users]


class ProjectRelationshipForm(forms.ModelForm):
    class Meta:
        model = timepiece.ProjectRelationship
        fields = ('types',)

    def __init__(self, *args, **kwargs):
        super(ProjectRelationshipForm, self).__init__(*args, **kwargs)
        self.fields['types'].widget = forms.CheckboxSelectMultiple(
            choices=self.fields['types'].choices
        )
        self.fields['types'].help_text = ''


class SearchForm(forms.Form):
    search = forms.CharField(required=False, label='')
    search.widget.attrs['placeholder'] = 'Search'

class UserSearchForm(forms.Form):

    search = forms.CharField(required=False, label='')
    search.widget.attrs['placeholder'] = 'Search'
    staff = forms.ChoiceField(label='Filter on staff:',
                              choices=[ ( 'all', 'All'), ('staff', 'Staff only'), ('non-staff', 'Non staff') ],
                              required=False,
                              initial='staff')


class UserForm(forms.ModelForm):

    class Meta:
        model = auth_models.User
        fields = ('first_name', 'last_name', 'email')

    def __init__(self, *args, **kwargs):
        super(UserForm, self).__init__(*args, **kwargs)
        for name in self.fields:
            self.fields[name].required = True


class UserProfileForm(forms.ModelForm):
    groups = forms.ModelMultipleChoiceField(
        queryset=auth_models.Group.objects.all(),
        widget=CheckboxSelectMultiple)

    class Meta:
        model = timepiece.UserProfile
        exclude = ('user', 'amount', 'billable_amount',
                   'authenticate_token', 'project_names_to_ignore')

    def __init__(self, creator, *args, **kwargs):

        profile = kwargs.get('instance', None)
        if profile:
            initial = kwargs.get('initial', {})
            initial.setdefault('groups', profile.user.groups.all())
            kwargs['initial'] = initial

        super(UserProfileForm, self).__init__(*args, **kwargs)

        if not creator.is_superuser and not creator.is_staff:
            del self.fields['is_staff']
            del self.fields['groups']
            del self.fields['required_daily_work_hours']
        else:
            self.fields['impd_client'].label = "Client"

        if not creator.is_superuser:
            del self.fields['impd_client']

    def save(self, creator, user):
        profile = super(UserProfileForm, self).save(commit=False)
        profile.user = user
        profile.save()

        if user.profile != profile:
            user.profile = profile
            user.save()

        if not creator.is_superuser:
            profile.impd_client = creator.profile.impd_client
            profile.save()

        if user.profile is None:
            user.profile = profile
            user.save()

        if creator.is_superuser or creator.is_staff:
            user = self.instance.user
            user.groups = self.cleaned_data['groups']
            user.save()
            # for group in self.cleaned_data['groups']:
            #     group.user_set.add(user)

        return self.instance


class ProjectSearchForm(forms.Form):
    search = forms.CharField(required=False, label='')
    search.widget.attrs['placeholder'] = 'Search'
    status = forms.ChoiceField(required=False, choices=[], label='')

    def __init__(self, *args, **kwargs):
        super(ProjectSearchForm, self).__init__(*args, **kwargs)
        PROJ_STATUS_CHOICES = [('any', 'Any Status')]
        PROJ_STATUS_CHOICES.extend((a.pk, a.label) for a
                in Attribute.objects.all().filter(type="project-status"))
        self.fields['status'].choices = PROJ_STATUS_CHOICES

    def save(self):
        search = self.cleaned_data.get('search', '')
        status = self.cleaned_data.get('status', '')
        if not status:
            status = Attribute.objects.get(label='open')
        else:
            try:
                status = int(status)
                status = Attribute.objects.get(pk=status)
            except (TypeError, ValueError):
                try:
                    status = Attribute.objects.get(label=status)
                except Attribute.DoesNotExist:
                    "Just return the value as is."
        return (search, status)


class DeleteForm(forms.Form):
    """
    Returns True if the object was deleted
    """
    def __init__(self, *args, **kwargs):
        self.instance = kwargs.pop('instance', None)
        super(DeleteForm, self).__init__(*args, **kwargs)

    def save(self):
        if self.instance:
            try:
                self.instance.delete()
            except AssertionError:
                return False
            else:
                return True
        return False


class BillableHoursForm(forms.Form):
    people = forms.MultipleChoiceField(required=False)
    activities = forms.ModelMultipleChoiceField(
        queryset=timepiece.Activity.objects.all(),
        required=False,
        initial=timepiece.Activity.objects.all())
    project_types = forms.ModelMultipleChoiceField(
        queryset=timepiece.Attribute.objects.all(),
        required=False,
        initial=timepiece.Attribute.objects.all())

    def __init__(self, *args, **kwargs):
        choices = kwargs.pop('choices', None)
        super(BillableHoursForm, self).__init__(*args, **kwargs)

        if choices:
            people = choices.get('people', [])
            if people:
                self.fields['people'].choices = people
                self.fields['people'].initial = [p[0] for p in people]

    def save(self):
        return {
            'people': self.cleaned_data['people'],
            'activities': self.cleaned_data['activities'],
            'project_types': self.cleaned_data['project_types']
        }


class ProjectHoursSearchForm(forms.Form):
    week_start = forms.DateField(label='Week of', required=False,
            input_formats=('%Y-%m-%d',),
            widget=forms.DateInput(format='%Y-%m-%d'))

    def clean_week_start(self):
        week_start = self.cleaned_data.get('week_start', None)
        return utils.get_week_start(week_start, False) if week_start else None


class ProjectHoursForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(ProjectHoursForm, self).__init__(*args, **kwargs)

    class Meta:
        model = ProjectHours
        exclude = []

class SalaryForm(forms.ModelForm):
    class Meta:
        model = Salary
        exclude=["user", "date"]

class AggregatedTimesheetFormByProject(forms.Form):

    project = forms.ModelChoiceField(label='Project:',
                                     queryset=Project.objects.order_by("business__name", "name"))

    def __init__(self, user, *args, **kwargs):
        super(AggregatedTimesheetFormByProject, self).__init__(*args, **kwargs)
        self.fields['project'].label_from_instance = lambda obj: format(obj.long_name())
        self.fields['project'].queryset = Project.objects.filter(users=user).order_by("business__name", "name")

    def save(self):
        return { 'project': self.cleaned_data['project'] }

class GraphFilterForm(forms.Form):

    business = forms.ModelChoiceField(required=False, label='Business:',
                                      queryset=timepiece.Business.objects.order_by("name", "name"))
    project = forms.ModelChoiceField(required=False, label='Project:',
                                     queryset=Project.objects.order_by("business__name", "name"))
    user = forms.ModelChoiceField(required=False, label='User:',
                                  queryset=auth_models.User.objects.order_by("username"))

    enabled_series = forms.MultipleChoiceField(required=False, label="Graphs",
                                               choices = ( ("all_hours", "all hours"), ("billable_hours", "billable hours"),
                                                           ("expected_hours", "expected hours"), ("atrate","atrate"),
                                                           ("cash_flow_atrate", "cash flow atrate"),
                                                           ("cash_flow_atrate_with_expenses", "cash flow atrate with expenses"),
                                                           ("cash_flow_invoiced", "cash flow invoiced"),
                                                           ("salaries", "salaries"), ("invoices","invoices"), ("expenses","expenses&salaries") ),
                                               widget = CheckboxSelectMultiple)

    def __init__(self, user, *args, **kwargs):
        super(GraphFilterForm, self).__init__(*args, **kwargs)
        self.fields['project'].label_from_instance = lambda obj: format(obj.long_name())
        self.fields['project'].queryset = Project.objects.filter(users=user).order_by("business__name", "name")
        self.fields['business'].queryset = BusinessPermissions.active_businesses_for_user(user).order_by("name", "name")

    def save(self):
        v = {}
        if self.cleaned_data['project'] is not None:
            v['project'] = self.cleaned_data['project']
        if self.cleaned_data['user'] is not None:
            v['user'] = self.cleaned_data['user']
        if self.cleaned_data['business'] is not None:
            v['project__business'] = self.cleaned_data['business']
        return v

class SalaryFilterForm(forms.Form):
    user = forms.ModelChoiceField(required=False, label='User:',
                                  queryset=auth_models.User.objects.order_by("username"))

    def save(self):
        v = {}
        if self.cleaned_data['user'] is not None:
            v['user'] = self.cleaned_data['user']
        return v

def parse_hours_raw(hours_raw):
    if ':' in hours_raw:
        hours,minutes = hours_raw.split(":")
        hours = int(hours)
        minutes = int(minutes)
    else:
        hours_raw = hours_raw.replace(",",".")
        if "." not in hours_raw:
            hours = int(hours_raw)
            minutes = 0
        else:
            total_hours = float(hours_raw)
            total_minutes = total_hours*60
            minutes = total_minutes%60
            hours = (total_minutes-minutes)/60
    return hours, minutes

def lookup_project(name, projects):

    rxp = re.compile('[^0-9a-zA-Z]', flags=re.I)
    convert_name = lambda n: rxp.sub('', n).lower()

    lookup_name = convert_name(name)
    for project in projects:
        if lookup_name == convert_name(project):
            return project
    raise LookupError("Project %s does not exist" % name)

def createIssueStatusFormset(business):
    formset = modelformset_factory(timepiece.Issue, form=IssueStatusForm, extra=0 ,can_delete=True, exclude=[])
    formset.form = staticmethod(curry(IssueStatusForm, business=business))
    return formset
    
expense_formset = modelformset_factory(timepiece.Expense, can_delete=True, extra=2, exclude=[])
permissions_formset = modelformset_factory(timepiece.BusinessPermissions, form=EditPersonPermission,extra=0, exclude=['user', 'business'] )

class ExpenseForm(forms.Form):
    date = forms.DateField(required=True)
    amount = forms.FloatField(required=True)
    description = forms.CharField()
    paid = forms.BooleanField()

class RateForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ('billable_amount', 'amount')
rate_formset = modelformset_factory(timepiece.UserProfile, form=RateForm, can_delete=False, extra=0)

class SprintInvoiceReportSettingsForm(forms.Form):

    start_end_time = forms.BooleanField(initial=True, required=False)
    ctc = forms.BooleanField(initial=False, required=False)
    billable = forms.BooleanField(initial=True, required=False)
    view_actual_hours = forms.BooleanField(initial=True, required=False)
    view_budget = forms.BooleanField(initial=True, required=False)
    issue_assignee = forms.BooleanField(initial=False, required=False)
    issue_status = forms.BooleanField(initial=False, required=False)
    only_issues_with_time = forms.BooleanField(initial=False, required=False)
    start = forms.DateField(initial=None, required=False)
    end = forms.DateField(initial=None, required=False)

    include_billable_per_user = forms.BooleanField(label="Tick to include billable per user", initial=True, required=False)
    only_these_statuses = forms.MultipleChoiceField( label="Only include these statuses",
                                                     required=True, initial=('all',),
                                                     widget = CheckboxSelectMultiple)
    only_assigned_to = forms.MultipleChoiceField(label="Only assigned to these users",
                                                 initial=('all',), required=False,
                                                 widget = CheckboxSelectMultiple)

    only_these_issue_numbers = forms.MultipleChoiceField(required=False,
                                                     widget=CheckboxSelectMultiple)
    include_adhoc_issues = forms.BooleanField(label="Include Adhoc issues", initial=False, required=False)

    def __init__(self, project, bp, only_these_issues=None, *args, **kwargs):
        super(SprintInvoiceReportSettingsForm, self).__init__(*args, **kwargs)
        self.bp = bp
        self.project = project
        if not self.bp.has_view_ctc_billable_rates:
            del self.fields['ctc']
            del self.fields['billable']
            del self.fields['include_billable_per_user']
        if not self.bp.has_view_ctc_rates and 'ctc' in self.fields:
            del self.fields['ctc']
        if not bp.has_view_actual_hours:
            del self.fields['view_actual_hours']
            del self.fields['start_end_time']
        if not bp.has_view_budget:
            del self.fields['view_budget']

        if project:
            self.fields['only_these_statuses'].choices = [('all', 'Any status'),] + list( [ (x['id'],x['status2__name']) for x in project.issues.values('id', 'status2__name').distinct()] )
            self.fields['only_assigned_to'].choices = [('all', 'Any user'),] + list( [ (x['assigned_to__username'],x['assigned_to__username']) for x in project.issues.exclude(assigned_to__isnull=True).values('assigned_to__username').distinct()] )

        if only_these_issues is None:
            if project:
                only_these_issues = project.issues.all()
            else:
                only_these_issues = []
        self.fields['only_these_issue_numbers'].choices = [ (issue.number, issue.number) for issue in only_these_issues ]
        self.fields['only_these_issue_numbers'].initial = [ issue.number for issue in only_these_issues ]

    @classmethod
    def get_initial_data_for_priceless_summary(self):
        return {'ctc': False,
                'billable': False,
                'view_actual_hours': False,
                'view_budget': False,
                'issue_assignee': False,
                'issue_status': False,
                'only_issues_with_time': True,
                'start': None,
                'end': None,
                'include_billable_per_user': False,
                'only_these_statuses': ['all'],
                'only_assigned_to': ['all'],
                'include_adhoc_issues': True}


class SprintQuoteReportSettingsForm(forms.Form):

    preamble_type = forms.ChoiceField( label="Preamble type",
                                       required=False,
                                       choices = ( ("billable", "Estimates"),
                                                   ("quote", "Quote") ) )

    only_these_statuses = forms.MultipleChoiceField( label="Only include these statuses",
                                                     required=True, initial=('New',),
                                                     widget = CheckboxSelectMultiple)

    include_rates = forms.BooleanField(label="Tick to include rates", initial=False, required=False)
    show_hours = forms.BooleanField(label="Tick to show hours", initial=False, required=False)
    show_breakdown = forms.BooleanField(label="Tick to show breakdown", initial=False, required=False)
    show_billable = forms.BooleanField(label="Tick to show billable cost for the sprint", initial=True, required=False)
    show_issue_billable = forms.BooleanField(label="Tick to show billable cost per item", initial=True, required=False)

    preferred_user_for_estimates = forms.ChoiceField( label="User's estimates to use where conflicts",
                                                      required=False )

    include_exclude_vat = forms.ChoiceField( label="Include or Exclude VAT in quote",
                                                     required=True,
                                                     choices = ( ("exclude_vat", "Costs exclude VAT"),
                                                                 ("include_vat", "Costs include VAT"),
                                                                 ("no_vat", "Don't show VAT message"),
                                                    )
                                            )

    is_final = forms.BooleanField(label="Tick for final, untick for provisional",
                                  initial=False, required=False)

    only_these_issue_numbers = forms.MultipleChoiceField(required=False,
                                                     widget=CheckboxSelectMultiple)
    include_adhoc_issues = forms.BooleanField(label="Include Adhoc issues", initial=False, required=False)

    def __init__(self, project, bp, only_these_issues=None, *args, **kwargs):
        super(SprintQuoteReportSettingsForm, self).__init__(*args, **kwargs)
        self.bp = bp
        self.project = project
        if not self.bp.has_view_ctc_billable_rates or not self.bp.has_view_ctc_rates:
            del self.fields['show_billable']

        self.fields['only_these_statuses'].choices = [('all', 'Any status'),] + list( [ (x['id'],x['status2__name']) for x in project.issues.values('id', 'status2__name').distinct()] )
        self.fields['preferred_user_for_estimates'].choices = [ (x.user.id, x.user) for x in BusinessPermissions.by_user(project.business).values() if x.has_estimate_own_points ]

        if only_these_issues is None:
            only_these_issues = project.issues.all()
            only_these_issues = project.issues.filter(issue_type='issue')
        self.fields['only_these_issue_numbers'].choices = [ (issue.number, issue.number) for issue in only_these_issues ]
        self.fields['only_these_issue_numbers'].initial = [ issue.number for issue in only_these_issues ]

class NewBusinessDocumentForm(forms.ModelForm):
    class Meta:
        model = timepiece.BusinessDocument
        exclude = ( 'filename', 'business', 'created_by', 'created_at', 'deleted', 'token', 'mime_type', 'modified_by', 'modified_at' )

class EditBusinessDocumentForm(forms.ModelForm):

    project = GroupedModelChoiceField('business', required=False, queryset=timepiece.Project.objects.all().filter_open().order_by("business__name", "name"))

    class Meta:
        model = timepiece.BusinessDocument
        fields = ( 'doc_type', 'comments', 'project', 'filename', 'doc' )


class GenerateBusinessDocumentForm(forms.Form):

    title = forms.CharField(required=True, max_length=255)
    filename = forms.CharField(required=True, max_length=255)
    doc_type = forms.ChoiceField(required=True, choices=timepiece.BusinessDocument.DOC_TYPE_CHOICES)
    content = forms.CharField(widget=forms.Textarea, required=True)

class IssueCheckboxContextMenuChangeStateForm(forms.Form):

    status = forms.ChoiceField( label="New status",
                                required=True, initial=('New',) )

    def __init__(self, project, *args, **kwargs):
        super(IssueCheckboxContextMenuChangeStateForm, self).__init__(*args, **kwargs)
        self.fields['status'].choices = [(None, ''),] + list( [ (x.id,x.name) for x in IssueStatus.objects.filter(business=project.business).order_by("name")] )
        self.fields['status'].widget.attrs['onchange'] = "this.form.submit();"

class IssueCheckboxContextMenuSelectByStateForm(forms.Form):

    status = forms.ChoiceField( label="Status to select",
                                required=True, initial=('New',) )

    def __init__(self, project, *args, **kwargs):
        super(IssueCheckboxContextMenuSelectByStateForm, self).__init__(*args, **kwargs)
        statuses_in_use = IssueStatus.objects.filter(business=project.business).order_by("name")
        self.fields['status'].choices = [('na', ''),] + list([ (x.id, x.name) for x in statuses_in_use])
        self.fields['status'].widget.attrs['onchange'] = "this.form.submit();"

class IssueCheckboxContextMenuChangeAssigneeForm(forms.Form):

    assignee = forms.ChoiceField( label="New assignee",
                                required=True, initial=('New',) )

    def __init__(self, project, *args, **kwargs):
        super(IssueCheckboxContextMenuChangeAssigneeForm, self).__init__(*args, **kwargs)
        self.fields['assignee'].choices = [ ('', '') ] + [ (x.id, str(x)) for x in project.business.users ]
        self.fields['assignee'].widget.attrs['onchange'] = "this.form.submit();"

class IssueCheckboxContextMenuActiveIssueForm(forms.Form):

    focus_issue = forms.ChoiceField(required=True)

    def __init__(self, project, label, *args, **kwargs):
        super(IssueCheckboxContextMenuActiveIssueForm, self).__init__(*args, **kwargs)
        self.fields['focus_issue'].choices = [ ('', '') ] + [ (x.id, "%s %s" % (x.number, x.subject)) for x in project.issues.all().order_by_project_id(project.id) ]
        self.fields['focus_issue'].label = label
        self.fields['focus_issue'].widget.attrs['onchange'] = "this.form.submit();"

class IssueCheckboxContextMenuChangeIssueAdhocForm(forms.Form):

    adhoc = forms.ChoiceField( label="Adhoc",
                               required=True, initial=('New',) )

    def __init__(self, project, label, *args, **kwargs):
        super(IssueCheckboxContextMenuChangeIssueAdhocForm, self).__init__(*args, **kwargs)
        self.fields['adhoc'].choices = [ ('', ''), ('set_adhoc', "Make adhoc"), ('unset_adhoc', 'Make standard issue') ]
        self.fields['adhoc'].label = label
        self.fields['adhoc'].widget.attrs['onchange'] = "this.form.submit();"


# class NewCalendarEventForm(forms.ModelForm):
#     class Meta:
#         model = timepiece.CalendarEvent
#         fields = (
#             'user',
#             'project',
#             'hours_planned',
#             'date'
#         )

class CalendarFilterForm(forms.Form):
    users = forms.ModelMultipleChoiceField(required=False,
                                           queryset=User.objects.all(),
                                           widget=CheckboxSelectMultiple,
                                           initial=User.objects.none())
    businesses = forms.ModelMultipleChoiceField(required=False,
                                                queryset=Business.objects.all(),
                                                widget=CheckboxSelectMultiple,
                                                initial=Business.objects.none())

    start = forms.DateField(initial=datetime.today(), required=False)
    end = forms.DateField(initial=datetime.today(), required=False)

    event_types = forms.MultipleChoiceField(required=False,
                                            choices = CalendarEvent.EVENT_TYPES + ( ("actual", "Actual"), ),
                                            widget=CheckboxSelectMultiple)
    actual_time_aggregation_mechanism = forms.ChoiceField(required=False,
                                                          initial='none',
                                                          choices=( ('none', 'individual events'), ('by_project', 'Total per project'),
                                                                    ('by_user','Total per user') ) )

    def __init__(self, allowed_users, allowed_businesses, *args, **kwargs):
        super(CalendarFilterForm, self).__init__(*args, **kwargs)
        self.fields['users'].queryset = allowed_users.order_by('username')
        self.fields['businesses'].queryset = allowed_businesses


    @property
    def filter_includes_actual_events(self):
        return 'actual' in self.cleaned_data['event_types']

    def save(self, calendar_events, entry_events, holiday_events):
        if len(self.cleaned_data['users'])>0:
            calendar_events = calendar_events.filter(user__in=self.cleaned_data['users'])
            entry_events = entry_events.filter(user__in=self.cleaned_data['users'])
        if len(self.cleaned_data['businesses'])>0:
            calendar_events = calendar_events.filter(Q(project__business__in=self.cleaned_data['businesses'])|Q(project__isnull=True))
            entry_events = entry_events.filter(project__business__in=self.cleaned_data['businesses'])
        if self.cleaned_data['start'] is not None:
            calendar_events = calendar_events.filter(start__gte=self.cleaned_data['start'])
            entry_events = entry_events.filter(start_time__gte=self.cleaned_data['start'])
            holiday_events = holiday_events.filter(applies_on__gte=self.cleaned_data['start'])
        if self.cleaned_data['end'] is not None:
            calendar_events = calendar_events.filter(start__lte=self.cleaned_data['end'])
            entry_events = entry_events.filter(end_time__lte=self.cleaned_data['end'])
            holiday_events = holiday_events.filter(applies_on__lte=self.cleaned_data['end'])
        if self.cleaned_data['event_types'] is not None and len(self.cleaned_data['event_types'])>0:
            calendar_events = calendar_events.filter(event_type__in=self.cleaned_data['event_types'])

        if self.cleaned_data['event_types'] is None or 'actual' not in self.cleaned_data['event_types']:
            entry_events = []
        else:

            if self.cleaned_data['actual_time_aggregation_mechanism'] == 'by_project':
                entry_events = entry_events.extra(select={'day': 'date( start_time )'}).values('user', 'project__business', 'day').annotate(Sum('hours'))
            elif self.cleaned_data['actual_time_aggregation_mechanism'] == 'by_user':
                entry_events = entry_events.extra(select={'day': 'date( start_time )'}).values('user', 'day').annotate(Sum('hours'))

        return calendar_events, entry_events, holiday_events

class CalendarEventCreateForm(forms.ModelForm):

    end = forms.DateTimeField(required=False)
    status = forms.ChoiceField(required=False,
                               initial='CONFIRMED',
                               choices=(CalendarEvent.EVENT_STATUSES))

    class Meta:
        model = CalendarEvent
        exclude = []

    def __init__(self, allowed_users, allowed_businesses, *args, **kwargs):
        super(CalendarEventCreateForm, self).__init__(*args, **kwargs)
        self.fields['user'].queryset = allowed_users.order_by('username')
        self.fields['business'].queryset = allowed_businesses
        self.fields['start'].widget.attrs['class'] = 'datetimepicker'
        self.fields['end'].widget.attrs['class'] = 'datetimepicker'
        self.fields['hours'].required=False

    def clean(self):
        data = self.cleaned_data
        if 'end' in data and data['end'] is not None:
            hours = ((data['end'] - data['start']).seconds)/(60*60)
        elif 'hours' not in data or data['hours'] is None:
            hours = self.instance.hours
        else:
            hours = data['hours']
        if hours == 0:
            if 'hours' in data:
                hours = data['hours']
            else:
                hours = 2 #default min
        data['hours'] = hours
        return data

class CalendarEventUpdateForm(forms.ModelForm):

    end = forms.DateTimeField()
    status = forms.ChoiceField(required=False,
                               initial='CONFIRMED',
                               choices=(CalendarEvent.EVENT_STATUSES))

    class Meta:
        model = CalendarEvent
        exclude = []

    def __init__(self, allowed_users, allowed_businesses, *args, **kwargs):
        super(CalendarEventUpdateForm, self).__init__(*args, **kwargs)
        self.fields['business'].required = False
        self.fields['user'].required = False
        self.fields['start'].required = False
        self.fields['hours'].required = False
        self.fields['end'].required = False
        self.fields['event_type'].required = False
        self.fields['status'].required = False
        self.fields['description'].required = False

        self.fields['user'].queryset = allowed_users.order_by('username')
        self.fields['business'].queryset = allowed_businesses
        self.fields['start'].widget.attrs['class'] = 'datetimepicker'
        self.fields['end'].widget.attrs['class'] = 'datetimepicker'

    def clean(self):
        data = self.cleaned_data

        if 'user' not in data or data['user'] is None:
            data['user'] = self.instance.user
        if 'start' not in data or data['start'] is None:
            data['start'] = self.instance.start
        if 'event_type' not in data or data['event_type'] is None or len(data['event_type']) == 0:
            data['event_type'] = self.instance.event_type
        if 'status' not in data or data['status'] is None or len(data['status']) == 0:
            data['status'] = self.instance.status
        if 'end' in data and data['end'] is not None:
            data['hours'] = ((data['end'] - data['start']).seconds)/(60*60)
        elif 'hours' not in data or data['hours'] is None:
            data['hours'] = self.instance.hours
        if 'description' not in data or data['description'] is None or len(data['description'])==0:
            data['description'] = self.instance.description
        return data

class BusinessCommentForm(forms.ModelForm):

    new_value = forms.CharField(widget=forms.Textarea, required=False)

    class Meta:
        model = BusinessComment
        exclude = [ 'business', 'modified_at', 'modified_by']

    def clean(self):
        data = super(BusinessCommentForm, self).clean()
        if 'new_value' in data:
            data['comment'] = data['new_value']

        return data

class TrafficChecklistForm(forms.ModelForm):
    class Meta:
        model = TrafficChecklist
        exclude = ['business', 'created_at', 'created_by', 'passed', 'modified_by', 'modified_at']

class DevChecklistForm(forms.ModelForm):
    class Meta:
        model = DevChecklist
        exclude = ['business', 'created_at', 'created_by', 'passed', 'modified_by', 'modified_at']


class FinanceChecklistForm(forms.ModelForm):

    class Meta:
        model = FinanceChecklist
        exclude = ['business', 'created_at', 'created_by', 'passed', 'modified_by', 'modified_at']

class QuickClockerForm(forms.Form):

    user = UserModelChoiceField(queryset=User.objects.none(), required=True)
    project = forms.ModelChoiceField(required=True, queryset=timepiece.Project.objects.none())

    def __init__(self, logged_in_user, users, projects, *args, **kwargs):
        self.users = users
        kwargs.setdefault('initial', {})['user'] = logged_in_user
        super(QuickClockerForm, self).__init__(*args, **kwargs)

        self.fields['user'].queryset = users
        self.fields['user'].choices = [ (x.id, x.username) for x in self.users ]
        self.fields['project'].queryset = projects
        self.fields['project'].choices = [ (x.id, "<b>%s</b>     %s <span searchable_name='%s' style='font-size:9px'>(%s)</span>"%(x.business.name, x.name, (x.name.lower() + " " + x.business.name.lower()), x.status3.name)) for x in projects ]

class QuickClockerClockOutForm(forms.Form):
    entry = forms.ModelChoiceField(required=True, queryset=Entry.objects.none(), label="")
    clock_out_time = forms.DateTimeField(label="")

    def __init__(self, entries, *args, **kwargs):
        super(QuickClockerClockOutForm, self).__init__(*args, **kwargs)
        self.fields['clock_out_time'].widget.attrs['class'] = 'datetimepicker'
        self.fields['entry'].queryset = entries
        self.fields['entry'].choices = [ (x.id, "<b>%s</b> issue%s <b>%s</b> %s"%(x.user.username, x.issue.number, x.issue.project.long_name(), x.start_time.strftime('%a %H:%M'))) for x in entries ]
        self.entries = entries

    def is_clocked_in(self):
        return self.entries

class QuickClockerEditEntry(forms.ModelForm):

    issue = GroupedModelChoiceField('issue', required=False, queryset=timepiece.Issue.objects.none())
    project = GroupedModelChoiceField('business', required=False, queryset=timepiece.Project.objects.none())

    class Meta:
        model = Entry
        fields = ['start_time', 'end_time', 'comments', 'issue']

    def __init__(self, projects, *args, **kwargs):
        kwargs.setdefault('initial', {})['project'] = kwargs['instance'].issue.project

        kwargs.setdefault('initial', {})['issue'] = kwargs['instance'].issue
        super(QuickClockerEditEntry, self).__init__(*args, **kwargs)
        self.fields['start_time'].widget.attrs['class'] = 'datetimepicker'
        self.fields['end_time'].widget.attrs['class'] = 'datetimepicker'
        self.fields['project'].queryset=projects
        self.fields['project'].choices=[ (x.id, x.long_name()) for x in projects ]

        if self.instance and self.instance.project:
            issues = self.instance.project.issues.all().order_by_project_id(self.instance.project.id)
            self.fields['issue'].queryset = issues
            self.fields['issue'].choices=[(None,"default"),] + [ (x.id, "issue%d: %s" % (x.number, x.subject)) for x in issues ]

class ScheduleFilterForm(forms.Form):
    year = forms.IntegerField(required=True)
    month = forms.ChoiceField(required=True, choices=( (1, 'Jan'), (2, 'Feb'),
                                                       (3, 'March'), (4, 'April'),
                                                       (5, 'May'), (6, 'June'),
                                                       (7, 'July'), (8, 'August'),
                                                       (9, 'September'), (10, 'October'),
                                                       (11, 'November'), (12, 'December') ))

    def clean_month(self):
        return int(self.cleaned_data['month'])

class ScheduleForm(forms.ModelForm):

    num_hours = forms.CharField(required=True)

    class Meta:
        model = Schedule
        fields=['num_hours']

    def clean(self):
        data = super(ScheduleForm, self).clean()
        num_hours = data['num_hours']
        if len(num_hours) > 1 and num_hours[-1] == 'd':
            num_hours = float(num_hours[:-1])*8
        elif len(num_hours) > 1 and num_hours[-1] == 'h':
            num_hours = int(num_hours[:1])
        data['num_hours'] = int(num_hours)
        return data

class ClientForm(forms.ModelForm):
    class Meta:
        model = Company
        exclude = [ 'created_at', 'modified_at' ]

class PersonLeaveForm(forms.Form):
    date = forms.DateField(initial=datetime.today(), required=True)
    reason = forms.ChoiceField(required=True,
                               choices=(('leave', 'Leave'),
                                        ('sickday', 'Sick'),
                                        ('office_closed', 'Office closed') ))
