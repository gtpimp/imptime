from django.views.generic import DetailView
from django.http import HttpResponse, HttpResponseRedirect
import unicodecsv as csv
from django.contrib.auth.decorators import login_required, permission_required
from django.utils.decorators import method_decorator
import timepiece.models as timepiece

class ProjectTimesheet(DetailView):
    template_name = 'timepiece/time-sheet/projects/view.html'
    model = timepiece.Project
    context_object_name = 'project'

    @method_decorator(permission_required('timepiece.view_project_time_sheet'))
    def dispatch(self, *args, **kwargs):
        return super(ProjectTimesheet, self).dispatch(*args, **kwargs)

    def get(self, *args, **kwargs):
        if 'csv' in self.request.GET:
            request_get = self.request.GET.copy()
            request_get.pop('csv')
            return_url = reverse('export_project_time_sheet',
                                 kwargs={'pk': self.get_object().pk})
            return_url += '?%s' % urllib.urlencode(request_get)
            return redirect(return_url)
        return super(ProjectTimesheet, self).get(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(ProjectTimesheet, self).get_context_data(**kwargs)
        project = self.object
        date_form = timepiece_forms.DateOnlyForm(self.request.GET)
        from_date, to_date = _get_filter_dates_only(self.request, context)
        entries_qs = timepiece.Entry.objects
        if from_date or to_date:
            entries_qs = entries_qs.timespan(from_date, to_date, span='month')

        entries_qs = entries_qs.filter_by_logged_in_user(self.request.user).filter(project=project)

        extra_values = ('start_time', 'end_time', 'comments', 'seconds_paused',
                'id', 'location__name', 'project__name', 'activity__name',
                'status')
        month_entries = entries_qs.date_trunc('month',
                extra_values).order_by('start_time')
        total = entries_qs.aggregate(hours=Sum('hours'))['hours']
        user_entries = entries_qs.order_by().values(
            'user__first_name', 'user__last_name').annotate(
            sum=Sum('hours')).order_by('-sum'
        )
        activity_entries = entries_qs.order_by().values(
            'activity__name').annotate(
            sum=Sum('hours')).order_by('-sum'
        )
        return {
            'project': project,
            'from_date': from_date,
            'to_date': to_date - datetime.timedelta(days=1) if to_date else None,
            'entries': month_entries,
            'total': total,
            'user_entries': user_entries,
            'activity_entries': activity_entries,
            'date_form': date_form,
        }


class CSVMixin(object):
    def render_to_response(self, context):
        response = HttpResponse(content_type='text/csv')
        fn = self.get_filename(context)
        response['Content-Disposition'] = 'attachment; filename=%s.csv' % fn
        rows = self.convert_context_to_csv(context)
        writer = csv.writer(response)
        for row in rows:
            writer.writerow(row)
        return response

    def get_filename(self, context):
        raise NotImplemented("You must implement this in the subclass")

    def convert_context_to_csv(self, context):
        "Convert the context dictionary into a CSV file"
        raise NotImplemented("You must implement this in the subclass")

class ProjectTimesheetCSV(CSVMixin, ProjectTimesheet):

    def get_filename(self, context):
        project = self.object.name
        if context['to_date']:
            if isinstance(context['to_date'], basestring):
                to_date_str = context['to_date'].replace(u'/', u'-')
            else:
                to_date_str = context['to_date'].strftime('%m-%d-%Y')
        else:
            to_date_str = 'All Entries'
        return "Project_timesheet {0} {1}".format(project, to_date_str)

    def convert_context_to_csv(self, context):
        rows = []
        rows.append([
            'Date',
            'Person',
            'Activity',
            'Location',
            'Time In',
            'Time Out',
            'Breaks',
            'Hours',
        ])
        for entry in context['entries']:
            data = [
                entry['start_time'].strftime('%x'),
                ' '.join((entry['user__first_name'],
                          entry['user__last_name'])),
                entry['activity__name'],
                entry['location__name'],
                entry['start_time'].strftime('%X'),
                entry['end_time'].strftime('%X'),
                seconds_to_hours(entry['seconds_paused']),
                entry['hours'],
            ]
            rows.append(data)
        total = context['total']
        rows.append(('', '', '', '', '', '', 'Total:', total))
        return rows

class CSVSprintExport(CSVMixin):
    def __init__(self, project_id , request):
        super(CSVSprintExport, self).__init__()
        self.project = timepiece.Project.objects.get(pk=project_id)
        self.request = request
        self.current_user = request.user

    def get_filename(self,context):
        clean_name = self.project.name.replace(" ","_")
        return "export_of_%s"%clean_name

    def convert_context_to_csv(self, context):
        business = self.project.business
        business_users = [user for user in self.project.business.users]
        business_users_and_names = [(user.username,user) for user in business_users]

        bp = timepiece.BusinessPermissions.for_user(user=self.current_user, business=business)

        header_row = []
        header_row.append('#')
        header_row.append('Title')

        if bp.has_view_ctc_billable_rates:

            if bp.has_view_ctc_rates:
                header_row.append("ctc")
            header_row.append("billable")

        for username,user in business_users_and_names:
            if bp.has_view_actual_hours:
                header_row.append("%s hours"%user.get_full_name())

            if bp.has_see_other_user_points:
                header_row.append("%s estimated"%user.get_full_name())

            if bp.has_view_ctc_billable_rates:
                if bp.has_view_ctc_rates:
                    header_row.append("%s ctc rate"%user.get_full_name())
                header_row.append("%s billable rate"%user.get_full_name())

        total = [header_row]

        def add_user_hours_to_data_row(data_row, user_hours, issue=None):
            if bp.has_view_ctc_billable_rates:
                if bp.has_view_ctc_rates:
                    data_row.append(user_hours['totals']['revenue'])
                data_row.append(user_hours['totals']['billed'])

            for username,user in business_users_and_names:
                if bp.has_view_actual_hours:
                    try:
                        value = user_hours['users'][username]['hours']
                    except KeyError:
                        value = 0
                    data_row.append(value)

                if issue is not None:
                    if bp.has_see_other_user_points:
                        try:
                            issue_point = timepiece.IssuePoints.objects.get(user=user, issue=issue)
                            points = float(issue_point.points) if issue_point.points else 0.0
                        except timepiece.IssuePoints.DoesNotExist:
                            points = 0.0
                        data_row.append(points)
                else:
                    data_row.append(0)

                if bp.has_view_ctc_billable_rates:
                    if bp.has_view_ctc_rates:
                        if username in user_hours['users']:
                            data_row.append( user_hours['users'][username]['rate'].amount )
                        else:
                            data_row.append('')
                    if username in user_hours['users']:
                        data_row.append(float(user_hours['users'][username]['rate'].billable_amount))
                    else:
                        data_row.append('')

        user_hours_for_issue = self.project.users_and_hours(issue__isnull=True, cache=False)
        data_row = ['unassigned', 'na']
        add_user_hours_to_data_row(data_row, user_hours_for_issue)
        total.append(data_row)

        for issue in self.project.issues.all():
            user_hours_for_issue = self.project.users_and_hours(issue__id=issue.id, cache=False)
            data_row = [issue.number, issue.subject]
            add_user_hours_to_data_row(data_row, user_hours_for_issue, issue=issue)
            total.append(data_row)

        return total

class CSVTimesheetExport(CSVMixin):
    def __init__(self, name, project, timesheet_entries, request):
        super(CSVTimesheetExport, self).__init__()
        self.name = name
        self.project = project
        self.timesheet_entries = timesheet_entries
        self.request = timesheet_entries
        self.current_user = request.user

    def get_filename(self,context):
        clean_name = self.project.name.replace(" ","_")
        return self.name + "_for_" + clean_name

    def convert_context_to_csv(self, context):
        
        rows = []
        header_row = ["id", "username", "date", "hours", "subject"]
        
        rows.append(header_row)
        
        for entry in self.timesheet_entries:
            rows.append( [entry.id, 
                          entry.user, 
                          entry.start_time.strftime('%Y-%b-%d (%a)'),
                          entry.hours,
                          entry.comments] )
        return rows



    
