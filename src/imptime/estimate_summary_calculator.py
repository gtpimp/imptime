import logging

from timepiece.models import BusinessPermissions
from timepiece.models import Project as Sprint
from timepiece.models import Rate, User

from imptime.helpers import estimate_helper

logger = logging.getLogger(__name__)


class EstimateSummaryCalculator(object):

    def get_data(self, user, sprint_id):
        sprint = Sprint.objects.get(pk=sprint_id)
        bp = BusinessPermissions.for_user(user, sprint.business)
        if not bp.has_view_ctc_billable_rates:
            raise Exception("No permission to view sprint estimate summary")

        comparative_estimates = estimate_helper.get_comparative_estimates(sprint, user)
        user_infos = self._get_user_infos(sprint)
        context = {
            "project_id": sprint.business_id,  # sic
            "sprint_id": sprint.id,
            "all_user_ids": comparative_estimates["by_user"].keys(),
            "user_infos": user_infos,
            "comparative_estimates": comparative_estimates,
        }
        return context

    def _get_rate(self, user_id, sprint_id):
        return Rate.full_rate_for_project(user_id=user_id, project_id=sprint_id)  # sic

    def _get_user_infos(self, sprint):
        users_ids = sprint.business.allowed_user_ids
        users = User.objects.filter(pk__in=users_ids).values("id", "username", "email")
        return dict(
            [(x["id"], {"username": x["username"], "email": x["email"]}) for x in users]
        )
