import logging
from sprint_serializer import SprintSerializer # change to new serializer once created
from datetime import datetime
import csv
from rest_framework.decorators import detail_route
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
            sprint = Sprint.objects.get(pk=sprint_id)
            bp = BusinessPermissions.for_user(request.user, sprint.business)
            if not bp.has_view_ctc_billable_rates:
                return self.error_response("No permission to view sprint estimate summary")

            data = {"status": "success", "payload": { 'estimate_summary': self._get_data(sprint, request.user) }}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _get_data(self, sprint, user):
        comparative_estimates = self._get_comparative_estimates(sprint, user)
        user_infos = self._get_user_infos(sprint)
        context = { 'project_id':sprint.business_id, #sic
                    'sprint_id':sprint.id,
                    'all_user_ids': comparative_estimates.keys(),
                    'user_infos': user_infos,
                    'comparative_estimates': comparative_estimates }
        return context
    
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

    @detail_route(methods=['POST'])
    def download_comparative_summary(self, request, pk):
        response, writer, data = self._prepare_csv(request, pk, "comparative_estimates")

        writer.writerow(['User', 'Type', 'Hours (by developer)', 'Velocity', 'Hours (with velocity)', 'Rate', 'Cost'])
        for user_id, estimates in data['comparative_estimates'].items():
            writer.writerow([data['user_infos'][user_id]['username'],
                             estimates['time_tracking_mode'],
                             estimates['original_hours'],
                             estimates['velocity'],
                             estimates['velocity_adjusted_hours'],
                             estimates['rate'],
                             estimates['cost']])
        return response

    def _prepare_csv(self, request, pk, filename_prefix):
        sprint_id = pk
        sprint = Sprint.objects.get(pk=sprint_id)
        data = self._get_data(sprint=sprint, user=request.user)

        response = HttpResponse(content_type='text/csv')
        filename = "{prefix}_for_{project_name}_{sprint_name}_at_{now}.csv".format(
            prefix=filename_prefix,
            project_name=sprint.business.name,
            sprint_name=sprint.name,
            now=datetime.now().strftime("%d%b%Y_%H%M"))
        response['Content-Disposition'] = 'attachment; filename="%s"' % filename
        writer = csv.writer(response)
        writer.writerow([sprint.business.name, sprint.name, sprint.id])
        writer.writerow([])
        return response, writer, data 

    def _get_user_infos(self, sprint):
        users_ids = sprint.business.allowed_user_ids
        users = User.objects.filter(pk__in=users_ids).values('id', 'username', 'email')
        return dict([ (x['id'], {'username':x['username'], 'email':x['email']}) for x in users ])
    
