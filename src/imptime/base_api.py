from django.core.paginator import Paginator
from django.conf import settings
from rest_framework import viewsets
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import Issue
from timepiece.models import BusinessPermissions
from timepiece.models import Entry as TimesheetEntry


class BaseViewSet(viewsets.ViewSet):

    """Apart from being a useful base class for lists, this class also
    helps to manage the naming confusion.
    - timepiece.Business = imptime.Project
    - timepiece.Project = imptime.Sprint
    """

    def apply_filter(self, qs, raw_filter_args):

        raw_filter_args = self._apply_business_project_switch(raw_filter_args)
        filter_args = {}

        for k, v in raw_filter_args.items():
            if k == 'ids':
                if v is None or (len(v) == 1 and
                                 (v[0] is None or v[0] == "null")):
                    filter_args['pk'] = None
                else:
                    filter_args['pk__in'] = [int(x) for x in v]
            else:
                filter_args[k] = v

        qs = qs.filter(**filter_args)
        return qs

    def apply_pagination(self, qs, pagination):

        if not pagination.get('enabled', True):
            return qs

        page_size = pagination.get(
            'page_size', settings.PAGINATION_DEFAULT_PAGINATION)
        current_page = pagination.get('current_page', 1)

        p = Paginator(qs, page_size)
        page = p.page(current_page)

        pagination['page_size'] = page_size
        pagination['current_page'] = current_page
        pagination['num_pages'] = p.num_pages
        pagination['num_items'] = p.count
        pagination['has_next_page'] = page.has_next()
        pagination['has_prev_page'] = page.has_previous()
        pagination['first_item_index'] = page.start_index()
        pagination['last_item_index'] = page.end_index()

        return page.object_list

    def _apply_business_project_switch(self, d):
        d_fixed = {}
        for k, v in d.items():
            if k.startswith('project_'):
                k = k.replace('project_', 'business_')
            if k.startswith('sprint_'):
                k = k.replace('sprint_', 'project_')
            d_fixed[k] = v
        return d_fixed

    def allowed_projects(self):
        return Project.objects.all()\
          .filter_by_logged_in_user(self.request.user)\
          .distinct()

    def allowed_project(self, pk):
        return self.allowed_projects().get(pk=pk)

    def allowed_sprints(self):
        return Sprint.objects.all()\
          .filter_by_logged_in_user(self.request.user)\
          .distinct()

    def allowed_sprint(self, pk):
        return self.allowed_sprints().get(pk=pk)

    def allowed_issues(self):
        allowed_sprint_ids = self.allowed_sprints()\
          .values_list('id', flat=True)
        return Issue.objects.all()\
                            .filter(project_id__in=allowed_sprint_ids)\
                            .distinct()

    def allowed_issue(self, pk):
        return self.allowed_issues().get(pk=pk)

    def allowed_timesheet_entries(self):
        return TimesheetEntry.objects.all()\
          .filter_by_logged_in_user(self.request.user).distinct()

    def allowed_timesheet_entry(self, pk):
        return self.allowed_timesheet_entries().get(pk=pk)

    def allowed_users(self):
        return BusinessPermissions.viewable_users(self.request.user).distinct()

    def allowed_user(self, pk):
        return self.allowed_users().get(pk=pk)
