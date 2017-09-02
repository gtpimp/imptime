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
from timepiece.models import BusinessPermissions, Entry, Rate, User, IssuePoints

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class EstimateSummaryViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            sprint_id = pk
            context = {}
            sprint = Sprint.objects.get(pk=sprint_id)

            bp = BusinessPermissions.for_user(request.user, sprint.business)
            if not bp.has_view_ctc_billable_rates:
                return self.error_response("No permission to view sprint estimate summary")

            #sprint.recalc_secondary_estimates()
            #sprint.calculate_new_stats(request.user)

            comparative_estimates = self._get_comparative_estimates(sprint, request.user)
            
            context = { 'project_id':sprint.business_id, #sic
                        'sprint_id':sprint_id,
                        'all_user_ids': comparative_estimates.keys(),
                        'comparative_estimates': comparative_estimates }

            data = {"status": "success", "payload": { 'estimate_summary': context }}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _get_comparative_estimates(self, sprint, user):
        users = sprint.business.get_users_allowed_to_estimate_on_business(user)
        user_estimates = IssuePoints.objects.filter(issue__project=sprint,
                                                    user_id__in=[x.pk for x in users])
        estimate_hours_per_user = user_estimates.order_by("user_id")\
                                                .values('user_id')\
                                                .annotate(total_hours=Sum('points'))
        
        estimates = {}
        for user_estimate_info in estimate_hours_per_user:
            rate = Rate.objects.get(user=user_estimate_info['user_id'],
                                    project=sprint) #sic
            velocity_adjusted_hours = (user_estimate_info['total_hours'] or 0) * (rate.velocity or 1)
            cost = velocity_adjusted_hours * rate.full_rate
            estimates[user_estimate_info['user_id']] = { 'user_id': user_estimate_info['user_id'],
                                                         'time_tracking_mode': rate.time_tracking_mode,
                                                         'original_hours': user_estimate_info['total_hours'],
                                                         'velocity': rate.velocity,
                                                         'velocity_adjusted_hours': velocity_adjusted_hours,
                                                         'rate': rate.full_rate,
                                                         'cost': cost }
        return estimates

    def _get_rate(self, user_id, sprint_id):
        return Rate.full_rate_for_project(user_id=user_id, project_id=sprint_id) #sic
