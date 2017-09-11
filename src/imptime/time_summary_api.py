import logging
from sprint_serializer import SprintSerializer # change to new serializer once created
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions, Entry, Rate, User

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class TimeSummaryViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            sprint_id = pk
            context = {}
            sprint = Sprint.objects.get(pk=sprint_id)

            all_entries = Entry.objects.filter(issue__project=sprint).order_by("start_time")
            cost_totals = all_entries.cost_totals_for_project(sprint)
            total_billable = cost_totals["billable"]

            time_summary = { "sprint_id": sprint.id,
                             "sprint": sprint.name,
                             "has_budget": sprint.spendable_budget > 0,
                             "per_user": {} }

            bp = BusinessPermissions.for_user(request.user, sprint.business)
            if not bp.has_view_ctc_billable_rates:
                return self.error_response("No permission to view time summary")

            developers = Rate.objects.filter(project=sprint, time_tracking_mode="developer")\
                                     .values_list('user', flat=True)

            sprint_users = sprint.business.get_users_allowed_to_estimate_on_business(request.user)
            active_sprint_users = all_entries.order_by('user_id').distinct().values('user_id')
            sprint_developers = User.objects.filter(pk__in=[x.id for x in sprint_users])\
                                            .filter(pk__in=active_sprint_users)\
                                            .filter(pk__in=developers)
            budget_ratio = total_billable / (sprint.spendable_budget or 1)

            for sprint_developer in sprint_developers:
                dev_stats = self.calculate_dev_hours_stats(sprint, sprint_developer)
                dev_hours_available, tester_hours_available, manager_hours_available, dev_hours_used, ratio, manager_rate, developer_rate, tester_rate = dev_stats
                values = {
                    "dev_hours_used": round(dev_hours_used, 2),
                    "dev_hours_available": round(dev_hours_available, 2),
                    "tester_hours_available": round(tester_hours_available, 2),
                    "manager_hours_available": round(manager_hours_available, 2),
                    "dev_rate": developer_rate,
                    "avg_tester_rate": tester_rate,
                    "avg_manager_rate": manager_rate
                }

                time_summary["per_user"][sprint_developer.id] = values

            time_summary['all_user_ids'] = [x.id for x in sprint_users]
            time_summary['budget_ratio'] = budget_ratio

            context["time_summary"] = time_summary
            data = {"status": "success", "payload": context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))


    def calculate_dev_hours_stats(self, sprint, user):
        stats = sprint.calculate_new_stats(user)
        spendable_budget = sprint.spendable_budget

        manager_rate = stats["per_role"]["manager"]["average_billable_rate"]
        developer_rate = stats["per_user"][user]["rate"].full_rate
        tester_rate = stats["per_role"]["tester"]["average_billable_rate"]

        try:
            this_users_rate = stats["per_user"][user]["rate"].full_rate
        except KeyError:
            this_users_rate = 0

        manager_ratio = sprint.time_ratio_for_role("manager")
        developer_ratio = sprint.time_ratio_for_role("developer")
        tester_ratio = sprint.time_ratio_for_role("tester")

        if spendable_budget == 0:
           ratio = 0
        else:
           ratio = 100 / float(spendable_budget)

        budget_used = stats["total"]["hours_billable_core_rate"]
        budget_available = spendable_budget - budget_used

        _b = budget_available
        try:
            remaining_time = _b / ( (manager_ratio*manager_rate) + (developer_ratio*this_users_rate) + (tester_ratio*tester_rate) )
        except ZeroDivisionError:
            remaining_time = 0

        remaining_dev_time = developer_ratio * remaining_time
        remaining_tester_time = tester_ratio * remaining_time
        remaining_manager_time = manager_ratio * remaining_time

        try:
            dev_hours_used = stats["per_user"][user]["hours"]
        except KeyError:
            dev_hours_used = 0

        return remaining_dev_time, remaining_tester_time, remaining_manager_time, dev_hours_used, ratio, manager_rate, developer_rate, tester_rate
