import logging
from sprint_serializer import SprintSerializer # change to new serializer once created
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import BusinessPermissions

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ProjectStatementViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            project_id = pk
            context = {}
            project = Project.objects.get(pk=project_id)
            bp = BusinessPermissions.for_user(request.user, project)  # sic
            if not bp.has_view_ctc_billable_rates:
                return self.error_response("No permission to view project statement")

            project_statement = { "project_id": project.id }
            context['project_statement'] = project_statement

            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    # def retrieve(self, request, pk):
#         try:
#             project_id = pk
#             context = {}
#             project = Project.objects.get(pk=project_id)

#             project_statement = { "project_id": project.id }

#             bp = BusinessPermissions.for_user(request.user, sprint.business)
#             if not bp.has_edit_issues:
#                 return self.error_response("No permission to view project statement")

#             developers = Rate.objects.filter(project=sprint, time_tracking_mode="developer")\
#                                      .values_list('user', flat=True)

#             users = sprint.business.get_users_allowed_to_estimate_on_business(request.user)
#             user_pks = [x.id for x in users]
#             users = User.objects.filter(pk__in=user_pks).filter(pk__in=developers)
#             # users = BusinessPermissions.active_users_for_business(sprint.business.pk)\
#             #                            .filter(pk__in=developers)

#             for user in users:
#                 dev_stats = calculate_dev_hours_stats(sprint, user)
#                 dev_hours_available, tester_hours_available, manager_hours_available, dev_hours_used, ratio, manager_rate, developer_rate, tester_rate = dev_stats

#                 values = {
#                     "percentage_over_budget": round(float(total_billable - sprint.spendable_budget)/sprint.spendable_budget * 100, 2) if sprint.spendable_budget else 0,
#                     "dev_hours_used": round(dev_hours_used, 2),
#                     "dev_hours_available": round(dev_hours_available, 2),
#                     "tester_hours_available": round(tester_hours_available, 2),
#                     "manager_hours_available": round(manager_hours_available, 2)
#                 }

#                 time_summary["per_user"][user.pk] = values

#             context["time_summary"] = time_summary

#             data = {"status": "success", "payload": context}

#         except Exception, ex:
#             logger.exception(ex)
#             return self.error_response(ex)

#         return HttpResponse(JSONRenderer().render(data))


# def calculate_dev_hours_stats(sprint, user):
#     stats = sprint.calculate_new_stats(user)
#     spendable_budget = sprint.spendable_budget

#     manager_rate = stats["per_role"]["manager"]["average_billable_rate"]
#     developer_rate = stats["per_role"]["developer"]["average_billable_rate"]
#     tester_rate = stats["per_role"]["tester"]["average_billable_rate"]

#     try:
#         this_users_rate = stats["per_user"][user]["rate"].full_rate
#     except KeyError:
#         this_users_rate = 0

#     manager_ratio = sprint.time_ratio_for_role("manager")
#     developer_ratio = sprint.time_ratio_for_role("developer")
#     tester_ratio = sprint.time_ratio_for_role("tester")

#     if spendable_budget == 0:
#        ratio = 0
#     else:
#        ratio = 100 / float(spendable_budget)

#     budget_used = stats["total"]["hours_billable_core_rate"]
#     budget_available = spendable_budget - budget_used

#     _b = budget_available
#     try:
#         remaining_time = _b / ( (manager_ratio*manager_rate) + (developer_ratio*this_users_rate) + (tester_ratio*tester_rate) )
#     except ZeroDivisionError:
#         remaining_time = 0

#     remaining_dev_time = developer_ratio * remaining_time
#     remaining_tester_time = tester_ratio * remaining_time
#     remaining_manager_time = manager_ratio * remaining_time

#     try:
#         dev_hours_used = stats["per_user"][user]["hours_billable"]
#     except KeyError:
#         dev_hours_used = 0

#     return remaining_dev_time, remaining_tester_time, remaining_manager_time, dev_hours_used, ratio, manager_rate, developer_rate, tester_rate
