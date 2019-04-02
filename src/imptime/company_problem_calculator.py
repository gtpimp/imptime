from django.db.models import Count, Q
from django.utils import timezone
from django.db.models import Count, Sum, FloatField
from dateutil.relativedelta import relativedelta
from imptime.models import CompanyProblem
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import ProjectReview as SprintReview
from timepiece.models import Issue, BusinessPermissions, Entry
from django.db.models import F, ExpressionWrapper

class CompanyProblemCalculator(object):

    def refresh_all(self, projects):
        company_problems = CompanyProblem.objects.filter(project__in=projects,
                                                         status__in=CompanyProblem.DELETABLE_STATUSES)
        for company_problem in company_problems:
            company_problem.delete()

        self._create_missed_review_schedules(projects)
        self._create_missing_rates(projects)
        self._create_missing_budgets(projects)
        self._create_missing_meta_info(projects)
        self._create_missing_review_schedules(projects)

    def _create_missing_rates(self, projects):
        entries = Entry.objects.filter(issue__project__business_id__in=projects)
        entries = entries.exclude(issue__project__status3__is_closed=True) #sic
        
        enriched = entries.order_by("issue__project__business_id", "issue__project_id", "user_id")\
                          .values("issue__project__business_id", "issue__project_id", "user_id")\
                          .filter(user__rates__project=F('issue__project'))\
                          .annotate(sum_hours=Sum('hours'),
                                    rate=F('user__rates__billable_amount'))

        enriched = enriched.filter(Q(rate=0)|Q(rate__isnull=True),
                                   sum_hours__gt=0)

        existing_rate_problems = CompanyProblem.objects.filter(project__in=projects, problem_type='missing_rate')
        resolved_rate_problems = existing_rate_problems.exclude(sprint__in=enriched.values_list("issue__project_id", flat=True))
        for resolved_rate_problem in resolved_rate_problems:
            resolved_rate_problem.delete()
        
        for entry_problem in enriched:
            CompanyProblem.objects.get_or_create(user_id=entry_problem['user_id'],
                                                 project_id=entry_problem['issue__project__business_id'], #sic
                                                 sprint_id=entry_problem['issue__project_id'], #sic
                                                 problem_type='missing_rate',
                                                 money_sensitive=True,
                                                 defaults={'description':"Time clocked but no rate set",
                                                           'status':'open'})

    def _create_missing_budgets(self, projects):
        entries = Entry.objects.filter(issue__project__business_id__in=projects)
        entries = entries.exclude(issue__project__status3__is_closed=True) #sic
        entries = entries.exclude(issue__project__budget__lt=0) #sic
        enriched = entries.order_by('issue__project__business_id', 'issue__project_id')
        enriched = entries.values('issue__project__business_id', 'issue__project_id').distinct()

        for entry_problem in enriched:
            CompanyProblem.objects.get_or_create(user_id=None,
                                                 project_id=entry_problem['issue__project__business_id'], #sic
                                                 sprint_id=entry_problem['issue__project_id'], #sic
                                                 problem_type='missing_budget',
                                                 money_sensitive=True,
                                                 defaults={'description':"Time clocked but no budget set",
                                                           'status':'open'})

    def _create_missing_meta_info(self, projects):
        sprints = Sprint.objects.filter(project_type__in=Sprint.CLOCKABLE_PROJECT_TYPES)\
                                .filter_open()
        sprints, estimates_by_sprint_id, hours_per_sprint_by_assignee = sprints.get_meta_info()
        for sprint in sprints:
            if sprint.id not in estimates_by_sprint_id:
                continue
            d = estimates_by_sprint_id[sprint.id]
            if d.get('num_adhoc_issues', 0) > 0:
                CompanyProblem.objects.get_or_create(user_id=None,
                                                     project_id=sprint.business_id, #sic
                                                     sprint_id=sprint.id,
                                                     problem_type='adhoc_issues',
                                                     money_sensitive=False,
                                                     defaults={'description':"%d issues are adhoc" % d['num_adhoc_issues'],
                                                               'status':'open'})
            elif d.get('num_missing_testable_issues', 0) > 0:
                CompanyProblem.objects.get_or_create(user_id=None,
                                                     project_id=sprint.business_id, #sic
                                                     sprint_id=sprint.id,
                                                     problem_type='missing_testables',
                                                     money_sensitive=False,
                                                     defaults={'description':"%d issues are missing testables" % d['num_missing_testable_issues'],
                                                               'status':'open'})
            elif d.get('num_issues_unassigned', 0) > 0:
                CompanyProblem.objects.get_or_create(user_id=None,
                                                     project_id=sprint.business_id, #sic
                                                     sprint_id=sprint.id,
                                                     problem_type='missing_assignee',
                                                     money_sensitive=False,
                                                     defaults={'description':"%d issues are not assigned" % d['num_missing_unassigned'],
                                                               'status':'open'})
            elif d.get('num_missing_estimates', 0) > 0:
                CompanyProblem.objects.get_or_create(user_id=None,
                                                     project_id=sprint.business_id, #sic
                                                     sprint_id=sprint.id,
                                                     problem_type='missing_estimate',
                                                     money_sensitive=False,
                                                     defaults={'description':"%d issues are not estimated" % d['num_missing_estimates'],
                                                               'status':'open'})
                
    def _create_missing_review_schedules(self, projects):
        sprints = Sprint.objects.filter(project_type__in=Sprint.REVIEW_SCHEDULE_PROJECT_TYPES)\
                                .filter_open()\
                                .filter(reviews__isnull=True)
        for sprint in sprints:
            CompanyProblem.objects.get_or_create(user_id=None,
                                                 project_id=sprint.business_id, #sic
                                                 sprint_id=sprint.id,
                                                 problem_type='missing_review_schedule',
                                                 money_sensitive=False,
                                                 defaults={'description':"Sprint requires a review schedule",
                                                           'status':'open'})

    def _create_missed_review_schedules(self, projects):
        sprints = Sprint.objects.filter_open()\
                                .filter(reviews__isnull=False)

        sprints = SprintReview.filter_has_an_issue_due_for_review(sprints)
        
        for sprint in sprints:
            CompanyProblem.objects.get_or_create(user_id=None,
                                                 project_id=sprint.business_id, #sic
                                                 sprint_id=sprint.id,
                                                 problem_type='expired_review_schedule',
                                                 money_sensitive=False,
                                                 defaults={'description':"At least one issue requires a review",
                                                           'status':'open'})
