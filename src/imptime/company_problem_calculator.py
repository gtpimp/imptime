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
        self._create_missing_rates(projects)

    def _create_missing_rates(self, projects):
        entries = Entry.objects.filter(issue__project__business_id__in=projects)
        entries = entries.exclude(issue__project__status3__name__in=Sprint.closed_states()) #sic
        
        enriched = entries.order_by("issue__project__business_id", "issue__project_id", "user_id")\
                          .values("issue__project__business_id", "issue__project_id", "user_id")\
                          .filter(user__rates__project=F('issue__project'))\
                          .annotate(sum_hours=Sum('hours'),
                                    rate=F('user__rates__billable_amount'))

        enriched = enriched.filter(Q(rate=0)|Q(rate__isnull=True),
                                   sum_hours__gt=0)
        
        for entry_problem in enriched:
            CompanyProblem.objects.get_or_create(user_id=entry_problem['user_id'],
                                                 project_id=entry_problem['issue__project__business_id'], #sic
                                                 sprint_id=entry_problem['issue__project_id'], #sic
                                                 problem_type='missing_rate',
                                                 money_sensitive=True,
                                                 defaults={'description':"Time clocked but no rate set",
                                                           'status':'open'})
