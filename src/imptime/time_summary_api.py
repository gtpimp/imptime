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
            if not bp.has_edit_issues:
                return self.error_response("No permission to view time summary")

            developers = Rate.objects.filter(project=sprint, time_tracking_mode="developer")\
                                     .values_list('user', flat=True)

            users = BusinessPermissions.active_users_for_business(sprint.business.pk)\
                                       .filter(pk__in=developers)

            for user in users:
                dev_stats = calculate_dev_hours_stats(sprint, user)
                dev_hours_available, tester_hours_available, manager_hours_available, dev_hours_used, ratio, manager_rate, developer_rate, tester_rate = dev_stats

                values = {
                    "percentage_over_budget": round(float(total_billable - sprint.spendable_budget)/sprint.spendable_budget * 100, 2) if sprint.spendable_budget else 0,
                    "dev_hours_used": round(dev_hours_used, 2),
                    "dev_hours_available": round(dev_hours_available, 2),
                    "tester_hours_available": round(tester_hours_available, 2),
                    "manager_hours_available": round(manager_hours_available, 2)
                }

                time_summary["per_user"][user.pk] = values

            context["time_summary"] = time_summary

            data = {"status": "success", "payload": context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))


def calculate_progress_ratio(rate, ratio):
    value = round(rate * ratio, 2)
    return value if value < 100 else 100

def calculate_dev_hours_stats(sprint, user):
    stats = sprint.calculate_new_stats(user)
    spendable_budget = sprint.spendable_budget

    manager_rate = stats["per_role"]["manager"]["average_billable_rate"]
    developer_rate = stats["per_role"]["developer"]["average_billable_rate"]
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
        dev_hours_used = stats["per_user"][user]["hours_billable"]
    except KeyError:
        dev_hours_used = 0

    return remaining_dev_time, remaining_tester_time, remaining_manager_time, dev_hours_used, ratio, manager_rate, developer_rate, tester_rate
