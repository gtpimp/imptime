from django.db.models import Count, Q
from django.utils import timezone
import math
from datetime import datetime
from dateutil.relativedelta import relativedelta
from imptime.models import Nudge, UserNudgeOrder
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import ProjectReview as SprintReview
from timepiece.models import Issue, BusinessPermissions, IssuePoints, Rate, CalendarEvent
from timepiece.models import ProjectIssueOrder as SprintIssueOrder
from .project_dashboard_api import get_nonexpired_project_ids

class Nudger(object):

    def refresh_all(self, user=None):

        nudges = Nudge.objects.all()
        if user is not None:
            nudges = nudges.filter(user=user)
        for project_id in get_nonexpired_project_ids():
            self.update_nudges_for_project(project_id, user=user)

        if user is not None:
            self.estimate_delivery_times(user)

    def estimate_delivery_times(self, user):
        nudges = Nudge.objects.filter(user=user).order_by_user_id(user.id)

        issue_points = IssuePoints.objects.filter(user=user,
                                                  issue__in=nudges.values_list('issue_id', flat=True))\
                                          .values('points', 'issue_id')
        estimates_by_issue_id = dict( [(x['issue_id'], x['points']) for x in issue_points] )

        rates = Rate.objects.filter(user=user,
                                    project_id__in=nudges.values_list('sprint_id', flat=True))\
                                    .order_by("project_id")\
                                    .values('project_id', 'velocity')\
                                    .distinct()
        velocities_by_sprint = dict( [(x['project_id'], x['velocity']) for x in rates] )

        now = timezone.now()
        start_time_each_day = 8 #nominal
        running_date = now.replace(hour=start_time_each_day, minute=0, second=0)
        running_work_hours_today = 0
        num_work_hours_per_day = user.profile.required_daily_work_hours
        for nudge in nudges:
            estimated_hours = float(estimates_by_issue_id.get(nudge.issue_id, 0) or 0) * float(velocities_by_sprint.get(nudge.sprint_id, 1) or 1)
            nudge.estimated_hours = estimated_hours

            nudge.estimated_start_at = running_date
            
            end_hours = running_work_hours_today+estimated_hours
            running_days = int(end_hours) / num_work_hours_per_day
            running_hours = end_hours - (running_days*num_work_hours_per_day)

            if running_days > 0:
                running_date += relativedelta(days=running_days)
                num_non_working_days_in_range = CalendarEvent.num_non_working_days_in_range(user, nudge.estimated_start_at, running_date)
                if num_non_working_days_in_range > 0:
                    running_date += relativedelta(days=num_non_working_days_in_range)

                new_start_time = start_time_each_day+running_hours
                running_date = running_date.replace(hour=int(new_start_time),
                                                    minute=int(math.modf(new_start_time)[0]*60))
                running_work_hours_today = running_hours
            else:
                running_date += relativedelta(hours=int(estimated_hours),
                                              minutes=int(math.modf(estimated_hours)[0]*60))
                running_work_hours_today = running_hours
            
            nudge.estimated_end_at = running_date
            nudge.save()
            
            
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
                              .filter_open(user)
        sprints_by_id = dict( [(x.id, x) for x in sprints] )

        # only these sprints get nudges for non-management issues. all
        # other sprints are in a management status and so only management
        # issues matter.
        sprint_types_for_non_management_issues = [ "sprint", "checklist" ]

        nudge_ids = []
        for issue in issues:

            if sprints_by_id[issue.project_id].project_type not in sprint_types_for_non_management_issues and \
               issue.issue_type in Issue.TESTABLE_ISSUE_TYPES:
                continue
            
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
