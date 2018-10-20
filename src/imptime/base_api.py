from django.core.paginator import Paginator
from django.conf import settings
from django.utils import timezone
import uuid
from django.db.models import Q
import math
from django.http import HttpResponse
from rest_framework.renderers import JSONRenderer
from rest_framework import viewsets
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import Issue, IssueReview, Tag, ProjectRole, Rate
from timepiece.models import ProjectReview as SprintReview
from timepiece.models import BusinessPermissions as ProjectPermissions
from timepiece.models import Entry as TimesheetEntry
from timepiece.models import ProjectDeadline as SprintDeadline
from imptime.models import VisualSpecDocument, VisualSpecIssue, ReleaseNote, Nudge, DecisionJournal
from imptime.models import WikiPage, VisualSpecAnnotation
from imptime.models import Mien, CompanyProblem, SprintSnapshot
from imptime.models import Schedule, ScheduleItem, IssueHistory, Feature, AnnotatedVisualSpecDocument
from testable.models import Testable
from invoicing.models import Invoice

class PermissionHelper():
    @classmethod
    def allowed_issues(self, user):
        allowed_sprint_ids = self.allowed_sprints(user)\
          .values_list('id', flat=True)
        return Issue.objects.all()\
                            .filter(project_id__in=allowed_sprint_ids)\
                            .distinct()

    @classmethod
    def allowed_sprints(self, user):
        return Sprint.objects.all()\
          .filter_by_logged_in_user(user)\
          .distinct()

    @classmethod
    def allowed_projects(self, user):
        return Project.objects.all()\
          .filter_by_logged_in_user(user)\
          .distinct()

    @classmethod
    def allowed_project_permissions(self, user):
        return ProjectPermissions.objects.filter(business__in=self.allowed_projects(user), #sic
                                                 is_active_member_of_business=True)


class BaseViewSet(viewsets.ViewSet):

    """Apart from being a useful base class for lists, this class also
    helps to manage the naming confusion.
    - timepiece.Business = imptime.Project
    - timepiece.Project = imptime.Sprint
    """

    def __init__(self, *args, **kwargs):
        super(BaseViewSet, self).__init__(*args, **kwargs)
        self._logged_in_permissions_by_project = {}
    
    def error_response(self, ex):
        data = {'status': 'failed', 'error': str(ex)}
        return HttpResponse(JSONRenderer().render(data), status=500)
    
    def apply_filter(self, qs, raw_filter_args):
        raw_filter_args = self._apply_business_project_switch(raw_filter_args)
        filter_args = {}

        for k, v in raw_filter_args.items():
            if k == 'ids':
                if v is None or (len(v) == 1 and
                                 (v[0] is None or v[0] == "null")):
                    filter_args['pk'] = None
                else:
                    filter_args['pk__in'] = [int(x) for x in v if x]
            else:
                filter_args[k] = v

        qs = qs.filter(**filter_args)
        return qs

    def apply_ordering(self, qs, ordering):
        if not ordering:
            return qs

        ordering_args = [ "-%s"%field if direction=='asc' else "%s"%field for field, direction in ordering.items() ]
        qs = qs.order_by(*ordering_args)
        return qs
    
    def apply_pagination(self, qs, pagination):

        if not pagination.get('enabled', True):
            return qs

        page_size = pagination.get(
            'page_size', settings.PAGINATION_DEFAULT_PAGINATION)
        if page_size > settings.MAX_PAGINATION:
            page_size = settings.MAX_PAGINATION
        current_page = pagination.get('current_page', 1)
        pagination['page_size'] = page_size
        pagination['current_page'] = current_page
        
        if isinstance(qs, list):
            page = qs[(current_page-1)*page_size:current_page*page_size]
            pagination['num_pages'] = math.ceil(len(qs)/page_size)
            pagination['num_items'] = len(qs)
            pagination['has_next_page'] = current_page < pagination['num_pages']
            pagination['has_prev_page'] = current_page > 0
            pagination['first_item_index'] = (current_page-1)*page_size
            pagination['last_item_index'] = (current_page*page_size)-1
            return page
        else:
            p = Paginator(qs, page_size)
            page = p.page(current_page)
            pagination['num_pages'] = p.num_pages
            pagination['num_items'] = p.count
            pagination['has_next_page'] = page.has_next()
            pagination['has_prev_page'] = page.has_previous()
            pagination['first_item_index'] = page.start_index()
            pagination['last_item_index'] = page.end_index()
            return page.object_list

    def _apply_business_project_switch(self, d):
        if not d.pop('__business_project_switch_filter_required', True):
            return d
        d_fixed = {}
        for k, v in d.items():
            if k.startswith('sprint__project_'):
                k = k.replace('sprint__project_', 'project__business_')
            elif k.startswith('project_'):
                k = k.replace('project_', 'business_')
            elif k.startswith('sprint_'):
                k = k.replace('sprint_', 'project_')
            d_fixed[k] = v
        return d_fixed

    def allowed_projects(self):
        return PermissionHelper.allowed_projects(self.request.user)

    def allowed_project(self, pk):
        return self.allowed_projects().get(pk=pk)

    def allowed_projects_for_money(self, project_qs):
        """ only returns projects the user can see billable information about """
        return Project.objects.filter(business_permissions__user=self.request.user,
                                      business_permissions__business__in=project_qs,
                                      business_permissions__can_view_ctc_billable_rates=True,
                                      pk__in=project_qs)
    
    def allowed_sprints(self):
        return PermissionHelper.allowed_sprints(self.request.user)

    def allowed_sprint(self, pk):
        return self.allowed_sprints().get(pk=pk)

    def allowed_template_sprints(self):
        return PermissionHelper.allowed_template_sprints(self.request.user)

    def allowed_issues(self):
        return PermissionHelper.allowed_issues(self.request.user)

    def allowed_issue(self, pk):
        return self.allowed_issues().get(pk=pk)

    def allowed_issue_reviews(self):
        return IssueReview.objects.filter(issue__in=self.allowed_issues())

    def allowed_features(self):
        return Feature.objects.filter(project__in=self.allowed_projects(), deleted=False)

    def allowed_feature(self, pk):
        return self.allowed_features().get(pk=pk)
    
    def allowed_timesheet_entries(self):
        users_timesheet_entries = TimesheetEntry.objects\
                                                .all()\
                                                .filter_by_logged_in_user(self.request.user)\
                                                .distinct()
        other_timesheet_entries_user_can_see = TimesheetEntry.objects\
                                               .all()\
                                               .filter(issue__project__business__business_permissions__user=self.request.user,
                                                       issue__project__business__business_permissions__can_view_actual_hours=True)

        qs =  TimesheetEntry.objects.filter(Q(pk__in=users_timesheet_entries.values_list('id', flat=True))|
                                            Q(pk__in=other_timesheet_entries_user_can_see.values_list('id', flat=True)))
        return qs

    def allowed_timesheet_entry(self, pk):
        return self.allowed_timesheet_entries().get(pk=pk)

    def allowed_users(self):
        return ProjectPermissions.viewable_users(self.request.user).distinct()

    def allowed_user(self, pk):
        return self.allowed_users().get(pk=pk)

    def allowed_project_user(self, project_id, user_id):
        return Project.objects.get(pk=project_id).users.get(pk=user_id)

    def allowed_visual_spec_documents(self):
        return VisualSpecDocument.objects.filter(Q(visual_spec_projects__project__in=self.allowed_projects())|
                                                 Q(visual_spec_issues__issue__in=self.allowed_issues())).distinct()

    def allowed_annotated_visual_spec_documents(self):
        return AnnotatedVisualSpecDocument.objects.filter(visual_spec_document__in=self.allowed_visual_spec_documents())
    
    def allowed_visual_spec_issues(self):
        return VisualSpecIssue.objects.filter(issue__in=self.allowed_issues())

    def allowed_visual_spec_annotations(self):
        return VisualSpecAnnotation.objects.filter(annotated_visual_spec_document__in=self.allowed_annotated_visual_spec_documents())

    def allowed_project_permissions(self):
        return PermissionHelper.allowed_project_permissions(self.request.user)

    def allowed_release_notes(self):
        return ReleaseNote.objects.all()

    def allowed_sprint_deadlines(self):
        return SprintDeadline.objects.filter(project__in=self.allowed_sprints()) #sic

    def allowed_sprint_reviews(self):
        return SprintReview.objects.filter(project__in=self.allowed_sprints()) #sic

    def allowed_nudges(self):
        return Nudge.objects.filter(user=self.request.user)

    def allowed_nudges_to_edit_by_schedule(self):
        return Nudge.objects.filter(user_id__in=self.allowed_schedules_to_edit().values_list('owner_id', flat=True).distinct())
    
    def allowed_schedules(self):
        return Schedule.objects.filter(Q(owner=self.request.user)|Q(viewers=self.request.user)|Q(editors=self.request.user))\
                               .order_by("name").distinct()

    def allowed_schedules_to_edit(self):
        return Schedule.objects.filter(Q(owner=self.request.user)|Q(editors=self.request.user))\
                               .order_by("name").distinct()
    
    def allowed_schedule_items(self):
        return ScheduleItem.objects.filter(schedule__in=self.allowed_schedules())

    def allowed_schedule_items_to_edit(self):
        return ScheduleItem.objects.filter(schedule__in=self.allowed_schedules_to_edit())
    
    def allowed_tags(self):
        return Tag.objects.filter(issues__in=self.allowed_issues())

    def allowed_sprint_snapshots(self):
        return SprintSnapshot.objects.filter(sprint__in=self.allowed_sprints())
    
    def allowed_project_roles(self, project):
        return ProjectRole.objects.filter(business=project) #sic
    
    def allowed_invoices(self):
        return Invoice.objects.filter(business__in=self.allowed_projects(), #sic
                                      business__business_permissions__user=self.request.user,
                                      business__business_permissions__can_view_invoices=True)

    def allowed_testables(self):
        return Testable.objects.filter(project__in=self.allowed_projects()) 
    
    def allowed_issue_histories(self): 
        non_sensitive = IssueHistory.objects.filter(money_sensitive=False,
                                                    original_issue__project__business__in=self.allowed_projects()\
                                                    .filter(business_permissions__user=self.request.user,
                                                            business_permissions__can_view_issue_history=True))
        sensitive = IssueHistory.objects.filter(money_sensitive=True,
                                                original_issue__project__business__in=self.allowed_projects_for_money(self.allowed_projects())\
                                                .filter(business_permissions__user=self.request.user,
                                                        business_permissions__can_view_issue_history=True))
        
        return IssueHistory.objects.filter(Q(pk__in=non_sensitive.values_list('id', flat=True))|
                                           Q(pk__in=sensitive.values_list('id', flat=True)))
    
    def allowed_sprint_rates(self):
        return Rate.objects.filter(project__business__in=self.allowed_projects())\
                           .filter(Q(project__business__business_permissions__user=self.request.user)&
                                   (Q(project__business__business_permissions__can_view_ctc_billable_rates=True)|
                                    Q(project__business__business_permissions__can_view_velocity=True)))
    
    def allowed_wiki_pages(self):
        non_sensitive_wiki_pages = WikiPage.objects.filter(money_sensitive=False,
                                                           project__in=self.allowed_projects()\
                                                           .filter(business_permissions__user=self.request.user,
                                                                   business_permissions__can_view_business_comments=True))
        sensitive_wikis = WikiPage.objects.filter(money_sensitive=True,
                                                  project__in=self.allowed_projects_for_money(self.allowed_projects())\
                                                  .filter(business_permissions__user=self.request.user,
                                                          business_permissions__can_view_business_comments=True))
                                                  
        return WikiPage.objects.filter(Q(pk__in=non_sensitive_wiki_pages.values_list('id', flat=True))|
                                       Q(pk__in=sensitive_wikis.values_list('id', flat=True)))

    def allowed_decision_journals(self):
        return DecisionJournal.objects.filter(project__in=self.allowed_projects()\
                                                              .filter(business_permissions__user=self.request.user,
                                                                      business_permissions__can_view_decision_journal=True),
                                              deleted=False)
                                      
    
    def allowed_company_problems(self):
        non_sensitive_company_problem_pages = CompanyProblem.objects.filter(money_sensitive=False,
                                                                            project__in=self.allowed_projects()\
                                                                            .filter(business_permissions__user=self.request.user))
        sensitive_company_problems = CompanyProblem.objects.filter(money_sensitive=True,
                                                                   project__in=self.allowed_projects_for_money(self.allowed_projects())\
                                                                   .filter(business_permissions__user=self.request.user))
        
        return CompanyProblem.objects.filter(Q(pk__in=non_sensitive_company_problem_pages.values_list('id', flat=True))|
                                             Q(pk__in=sensitive_company_problems.values_list('id', flat=True)))

    
    def allowed_miens(self):
        return Mien.objects.filter(user=self.request.user)
    
    def logged_in_permissions(self, project):
        if project.id in self._logged_in_permissions_by_project:
            return self._logged_in_permissions_by_project[project.id]
        pup = ProjectPermissions.for_user(self.request.user, project)
        self._logged_in_permissions_by_project[project.id] = pup
        return pup

    def generate_share_ref(self, m, force=False):
        now = timezone.now()
        share_ref_expires_at = now - timezone.timedelta(days=settings.SHARE_REF_EXPIRY_DAYS)
        if not force and m.share_ref and m.share_ref_created_at > share_ref_expires_at:
            return m.share_ref
        share_ref = str(uuid.uuid4()).replace("-","")
        m.share_ref = share_ref
        m.share_ref_created_at = now
        m.save()
        return m.share_ref

    def can_be_shared(self, m):
        now = timezone.now()
        share_ref_expires_at = now - timezone.timedelta(days=settings.SHARE_REF_EXPIRY_DAYS)
        return m.share_ref_created_at > share_ref_expires_at
        
