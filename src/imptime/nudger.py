from django.db.models import Count, Q
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from imptime.models import Nudge
from timepiece.models import Project as Sprint
from timepiece.models import ProjectReview as SprintReview
from timepiece.models import Issue

MAGIC_CONSTANT=50

class Nudger(object):

    def update_nudges_for_user(self, user):
        self.user = user
        self._nudge_for_assigned_issues()
        self._nudge_for_pending_reviews()
        self._nudge_for_deadlines()
        self._nudge_for_invalid_rates()
        self._nudge_for_invalid_budgets()
        self._nudge_for_missing_estimates()
        self._nudge_for_invalid_timesheets()
        self._nudge_for_appointments()
        self._nudge_for_inactive_projects()

    def _nudge_for_assigned_issues(self):

        sprints = Sprint.objects.all().filter_open()
        issues = Issue.objects.all()\
                              .filter_by_logged_in_user(self.user)\
                              .filter(project__in=sprints,
                                      assigned_to=self.user,
                                      adhoc=False)\
                              .filter_open(self.user)
        sprints_requiring_nudging = issues.order_by("project_id")\
                                          .values("project_id")\
                                          .annotate(num_issues=Count("project_id"))

        for to_nudge in sprints_requiring_nudging:
            nudge = Nudge.objects.get_or_create(user=self.user, sprint_id=to_nudge['project_id'],
                                                defaults={'nudginess_percent':0})[0]
            nudge.reason = "assigned_issues"
            nudge.description = "%s open issues assigned to you" % to_nudge['num_issues']
            nudge.issue_id = issues.filter(project_id=to_nudge['project_id'])\
                                   .order_by_project_id(to_nudge['project_id']).values('pk')[0]['pk']
            nudge.nudginess_percent = to_nudge['num_issues']*100/MAGIC_CONSTANT #meaningless calculation
            nudge.save()


    def _nudge_for_pending_reviews(self):
        import pdb; pdb.set_trace()
        sprint_reviews = SprintReview.objects.filter(review_by=self.user).annotate(num_issues=Count('project__issues')).filter(num_issues__gt=0)
        for sprint_review in sprint_reviews:
            review_by_date = timezone.now()-relativedelta(days=sprint_review.review_cycle_days)
            if sprint_review.must_always_review:
                issues_to_review = Issue.objects\
                                        .filter(project_id=sprint_review.project_id,
                                                reviews__reviewed_by=self.user)\
                                        .annotate(num_reviews=Count('reviews'))\
                                        .filter(Q(num_reviews=0)|Q(reviews__last_reviewed_at__lt=review_by_date))
            else:
                issues_to_review = Issue.objects\
                                        .filter(project_id=sprint_review.project_id)\
                                        .annotate(num_reviews=Count('reviews'))\
                                        .filter(Q(num_reviews=0)|Q(reviews__last_reviewed_at__lt=review_by_date))
            issue_to_review = issues_to_review.order_by_project_id(sprint_review.project_id).first()
            if issue_to_review is not None:
                nudge = Nudge.objects.get_or_create(user=self.user, sprint_id=sprint_review.project_id,
                                                    defaults={'nudginess_percent':0})[0]
                nudge.reason = "pending_reviews"
                nudge.description = "%s reviews to do" % issues_to_review.count()
                nudge.issue_id = issue_to_review.id
                nudge.nudginess_percent = issues_to_review.count()*100/MAGIC_CONSTANT #meaningless calculation
                nudge.save()

    def _nudge_for_deadlines(self):
        pass

    def _nudge_for_invalid_rates(self):
        pass

    def _nudge_for_invalid_budgets(self):
        pass

    def _nudge_for_missing_estimates(self):
        pass

    def _nudge_for_invalid_timesheets(self):
        pass

    def _nudge_for_appointments(self):
        pass

    def _nudge_for_inactive_projects(self):
        pass

    
