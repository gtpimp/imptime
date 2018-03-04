import logging
from sprint_serializer import SprintSerializer # change to new serializer once created
from datetime import datetime
import csv
from rest_framework.decorators import detail_route
from helpers import estimate_helper
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum, Avg
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
        comparative_estimates = estimate_helper.get_comparative_estimates(sprint, user)
        user_infos = self._get_user_infos(sprint)
        context = { 'project_id':sprint.business_id, #sic
                    'sprint_id':sprint.id,
                    'all_user_ids': comparative_estimates['by_user'].keys(),
                    'user_infos': user_infos,
                    'comparative_estimates': comparative_estimates }
        return context
    
    def _get_rate(self, user_id, sprint_id):
        return Rate.full_rate_for_project(user_id=user_id, project_id=sprint_id) #sic

    @detail_route(methods=['POST'])
    def download_comparative_summary(self, request, pk):
        response, writer, data = self._prepare_csv(request, pk, "comparative_estimates")

        writer.writerow(["Each row represents the cost if each developer did all work against their own estimates"])
        writer.writerow([])
        writer.writerow(['User',
                         'Developer hours (as estimated)',
                         'Velocity',
                         'Developer hours (with velocity)',
                         'Developer Rate',
                         'Developer Cost',
                         'Testing ratio',
                         'Tester estimates',
                         'Tester rate',
                         'Tester cost',
                         'Manager ratio',
                         'Manager estimates',
                         'Manager rate',
                         'Manager cost',
                         'Working cost',
                         'Scope creep',
                         'Total cost'])
        for user_id, estimates in data['comparative_estimates']['by_user'].items():
            writer.writerow([data['user_infos'][user_id]['username'],
                             estimates['developer_original_hours'],
                             estimates['developer_velocity'],
                             estimates['developer_adjusted_hours'],
                             estimates['developer_rate_with_commission'],
                             estimates['developer_cost'],
                             estimates['tester_ratio'],
                             estimates['tester_adjusted_hours'],
                             estimates['tester_rate_with_commission'],
                             estimates['tester_cost'],
                             estimates['manager_ratio'],
                             estimates['manager_adjusted_hours'],
                             estimates['manager_rate_with_commission'],
                             estimates['manager_cost'],
                             estimates['working_cost'],
                             estimates['ratio_scope_creep'],
                             estimates['total_cost']])
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
    
