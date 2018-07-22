from django.db.models import Count, Q
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from imptime.models import Nudge, UserNudgeOrder
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import ProjectReview as SprintReview
from timepiece.models import Issue, BusinessPermissions
from timepiece.models import ProjectIssueOrder as SprintIssueOrder
from project_dashboard_api import get_nonexpired_project_ids

class Nudger(object):

    # def update_nudges_for_user(self, user):
    #     self.user = user
    #     self._nudge_for_assigned_issues()
    #     self._nudge_for_pending_reviews()
    #     self._nudge_for_deadlines()
    #     self._nudge_for_invalid_rates()
    #     self._nudge_for_invalid_budgets()
    #     self._nudge_for_missing_estimates()
    #     self._nudge_for_invalid_timesheets()
    #     self._nudge_for_appointments()
    #     self._nudge_for_inactive_projects()
 
    def refresh_all(self, user=None):
        nudges = Nudge.objects.all()
        if user is not None:
            nudges = nudges.filter(user=user)
        for project_id in get_nonexpired_project_ids():
            self.update_nudges_for_project(project_id, user=user)
    
    def update_nudges_for_project(self, project_id, user=None):
        sprint_qs = Sprint.objects.all().filter(business_id=project_id)
        users = BusinessPermissions.active_users_for_business(project_id) #sic
        if user is not None:
            users = users.filter(pk=user.id)
        for user in users:
            self.update_nudges_for_sprints_and_user(user, sprint_qs)
        
    def update_nudges_for_sprints_and_user(self, user, sprint_qs):
        keep_these_nudge_ids = []
        keep_these_nudge_ids.extend(self._nudge_for_assigned_issues(sprint_qs, user))
        keep_these_nudge_ids.extend(self._nudge_for_pending_reviews(sprint_qs, user))
        keep_these_nudge_ids.extend(self._nudge_for_full_inboxes(sprint_qs, user))
        Nudge.objects.filter(user=user, sprint__in=sprint_qs)\
                     .exclude(pk__in=keep_these_nudge_ids)\
                     .exclude(reason='manual')\
                     .delete()

        open_issues_in_sprint = Issue.objects.all().filter(project__in=sprint_qs)\
                                                   .filter_open(user)
        Nudge.objects.filter(user=user, sprint__in=sprint_qs)\
                     .exclude(issue__in=open_issues_in_sprint)\
                     .delete()
        
    def _nudge_for_assigned_issues(self, sprint_qs, user):
        sprint_ids = sprint_qs.filter_assigned_tasks_are_active()\
                              .values_list("pk", flat=True)
        sprints = Sprint.objects.all().filter(pk__in=sprint_ids)
        issues = Issue.objects.all()\
                              .filter_by_logged_in_user(user)\
                              .filter(project__in=sprints,
                                      assigned_to=user)\
                              .exclude(issue_type='adhoc')\
                              .filter_open(user)

        nudge_ids = []
        for issue in issues:
            reason = "assigned_issues"
            nudge, is_new = Nudge.objects.get_or_create(user=user,
                                                        issue_id=issue.id,
                                                        sprint_id=issue.project_id,
                                                        reason=reason)
            nudge_ids.append(nudge.id)
            nudge.description = "Issue assigned to you"
            nudge.issue_id = issue.id
            nudge.due_date = issue.modified
            nudge.due_date_reason = "issue was modified"
            nudge.save()

            nudge_ids.append(nudge.id)

            if is_new:
                self.order_new_issue_nudge(issue, nudge, user)
            
        return nudge_ids

    def order_new_issue_nudge(self, issue, nudge, user):
        previous_issue = SprintIssueOrder.get_previous_issue(issue)
        if previous_issue is not None:
            previous_issue_nudge = Nudge.objects.filter(issue=previous_issue, user=user).first()
            if previous_issue_nudge is not None:
                UserNudgeOrder.insert_after(nudge, set_after_this_nudge=previous_issue_nudge)
    
    def _nudge_for_full_inboxes(self, sprint_qs, user):
        sprint_ids = sprint_qs.filter(project_type='inbox')\
                              .values_list("pk", flat=True)
        sprints = Sprint.objects.all().filter(pk__in=sprint_ids)
        issues = Issue.objects.all()\
                              .filter_by_logged_in_user(user)\
                              .filter(project__in=sprints)\
                              .filter_open(user)
        sprints_requiring_nudging = issues.order_by("project_id")\
                                          .values("project_id")\
                                          .annotate(num_issues=Count("project_id"))

        nudge_ids = []
        for to_nudge in sprints_requiring_nudging:
            reason = "inbox"
            nudge = Nudge.objects.get_or_create(user=user,
                                                sprint_id=to_nudge['project_id'],
                                                reason=reason)[0]
            nudge_ids.append(nudge.id)
            nudge.description = "%s issue%s in the inbox" % (to_nudge['num_issues'], ("s" if to_nudge['num_issues']>0 else ""))
            nudge.issue_id = issues.filter(project_id=to_nudge['project_id'])\
                                   .order_by_project_id(to_nudge['project_id']).values('pk')[0]['pk']
            nudge.due_date = issues.filter(project_id=to_nudge['project_id'])\
                                   .order_by("modified").values('modified')[0]['modified']
            nudge.due_date_reason = "oldest issue in the inbox"
            nudge.save()
        return nudge_ids

    
    def _nudge_for_pending_reviews(self, sprint_qs, user):
        sprint_ids = sprint_qs.values_list("pk", flat=True)
        sprint_reviews = SprintReview.objects.filter(review_by=user, project_id__in=sprint_ids)\
                                             .annotate(num_issues=Count('project__issues'))\
                                             .filter(num_issues__gt=0)

        nudge_ids = []
        for sprint_review in sprint_reviews:

            review_by_date = timezone.now()-relativedelta(days=sprint_review.review_cycle_days)
            if sprint_review.must_always_review:

                issues_to_review = Issue.objects.filter(project_id=sprint_review.project_id)\
                                                .exclude(reviews__reviewed_by=user, reviews__last_reviewed_at__gte=review_by_date)
                
            else:
                issues_to_review = Issue.objects\
                                        .filter(project_id=sprint_review.project_id)\
                                        .annotate(num_reviews=Count('reviews'))\
                                        .filter(Q(num_reviews=0)|Q(reviews__last_reviewed_at__lt=review_by_date))

            issue_to_review = issues_to_review.order_by_project_id(sprint_review.project_id).first()
            if issue_to_review is not None:
                nudge = Nudge.objects.get_or_create(user=user,
                                                    sprint_id=sprint_review.project_id,
                                                    reason='reviews')[0]
                nudge_ids.append(nudge.id)

                if sprint_review.project.project_type == "inbox":
                    nudge.description = "%s issues to process" % issues_to_review.count()
                    nudge.due_date = issues_to_review.order_by("created").values("created")[0]['created']
                    nudge.due_date_reason = "oldest issue was created"
                else:
                    nudge.description = "%s reviews to do" % issues_to_review.count()
                    nudge.due_date = issues_to_review.order_by("reviews__last_reviewed_at").values("reviews__last_reviewed_at")[0]['reviews__last_reviewed_at']
                    nudge.due_date_reason = "oldest issue was reviewed"
                nudge.issue_id = issue_to_review.id
                nudge.save()
        return nudge_ids

    # def _nudge_for_deadlines(self):
    #     pass

    # def _nudge_for_invalid_rates(self):
    #     pass

    # def _nudge_for_invalid_budgets(self):
    #     pass

    # def _nudge_for_missing_estimates(self):
    #     pass

    # def _nudge_for_invalid_timesheets(self):
    #     pass

    # def _nudge_for_appointments(self):
    #     pass

    # def _nudge_for_inactive_projects(self):
    #     pass

    
