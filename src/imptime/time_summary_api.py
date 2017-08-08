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
                             "per_user": {} }

            bp = BusinessPermissions.for_user(request.user, sprint.business)
            if not bp.has_edit_issues:
                return self.error_response("No permission to view time summary")

            developers = Rate.objects.filter(project=sprint, time_tracking_mode="developer")\
                                     .values_list('user', flat=True)

            users = BusinessPermissions.active_users_for_business(sprint.business.pk)\
                                       .filter(pk__in=developers)

            # users = User.objects.filter(business_permissions__business_id=sprint.business.pk)
            # user_pks = []
            # import pdb;pdb.set_trace()
            # for user in users:
            #     permission = user.business_permissions.filter(business_id=sprint.business.pk, is_active_member_of_business=True)
            #     if permission: user_pks.append(user.pk)

            for user in users:
                dev_stats = calculate_dev_hours_stats(sprint, user)
                dev_hours_available, dev_hours_used, ratio, manager_rate, developer_rate, tester_rate = dev_stats

                values = {
                    "total_billable": total_billable,
                    "manager_rate":  calculate_progress_ratio(manager_rate, ratio),
                    "developer_rate": calculate_progress_ratio(developer_rate, ratio),
                    "tester_rate":  calculate_progress_ratio(tester_rate, ratio),
                    "has_budget": sprint.spendable_budget > 0,
                    "percentage_over_budget": float(total_billable - sprint.spendable_budget)/sprint.spendable_budget if sprint.spendable_budget else 0,
                    "dev_hours_used": dev_hours_used,
                    "dev_hours_available": dev_hours_available
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

    # manager_rate = stats["per_role"]["manager"]["hours_billable_core_rate"]
    # developer_rate = stats["per_role"]["developer"]["hours_billable_core_rate"]
    # tester_rate = stats["per_role"]["tester"]["hours_billable_core_rate"]

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
    #users_rate = stats["per_user"][user]["rate"].full_rate  #   user stats["per_role"]["developer"]["hours_billable_core_rate"]

    if spendable_budget == 0:
       #spendable_budget = 1
       ratio = 0
    else:
       ratio = 100 / float(spendable_budget)

    budget_used = stats["total"]["hours_billable_core_rate"]
    budget_available = spendable_budget - budget_used

    # calculate the total time by reworking the formula:
    #  : dev_time*dev_rate + tester_time*tester_rate + manager_time*manager_rate = budget
    # with the substitution:
    #  : xxx_time = total_time*xxx_time_ratio
    #
    # _tt = sprint.time_ratio_for_role("tester")*float(stats["per_role"]["tester"]["average_billable_rate"])
    # _mm = sprint.time_ratio_for_role("manager")*float(stats["per_role"]["manager"]["average_billable_rate"])
    _b = budget_available
    # _d_rate = float(users_rate)
    # _d_ratio = sprint.time_ratio_for_role("developer")

    try:
        remaining_time = _b / ( (manager_ratio*manager_rate) + (developer_ratio*this_users_rate) + (tester_ratio*tester_rate) )
    except ZeroDivisionError:
        remaining_time = 0

    # if _d_rate > 0:
    #     remaining_time = _b/_d_rate * (1 / (_tt/_d_rate + _mm/_d_rate + _d_ratio))
    # else:
    #     remaining_time = 0

    remaining_users_time = developer_ratio * remaining_time
    try:
        dev_hours_used = stats["per_user"][user]["hours_billable"]
    except KeyError:
        dev_hours_used = 0

    return remaining_users_time, dev_hours_used, ratio, manager_rate, developer_rate, tester_rate
