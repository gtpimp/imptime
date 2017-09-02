import logging
from sprint_serializer import SprintSerializer # change to new serializer once created
from datetime import datetime
import csv
from rest_framework.decorators import detail_route
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
        comparative_estimates = self._get_comparative_estimates(sprint, user)
        user_infos = self._get_user_infos(sprint)
        context = { 'project_id':sprint.business_id, #sic
                    'sprint_id':sprint.id,
                    'all_user_ids': comparative_estimates.keys(),
                    'user_infos': user_infos,
                    'comparative_estimates': comparative_estimates }
        return context
    
    def _get_comparative_estimates(self, sprint, user):
        users = User.objects.filter(pk__in=[x.id for x in sprint.business.get_users_allowed_to_estimate_on_business(user)])
        developers = users.filter(rates__project_id=sprint.id, rates__time_tracking_mode='developer')
        developer_estimates = IssuePoints.objects.filter(issue__project=sprint,
                                                    user_id__in=[x.pk for x in developers])
        developer_estimate_hours = developer_estimates.order_by("user_id")\
                                                      .values('user_id')\
                                                      .annotate(total_hours=Sum('points'))
        
        estimates = {}
        for user_estimate_info in developer_estimate_hours:
            if not user_estimate_info['total_hours']:
                continue

            rate = Rate.objects.get(user=user_estimate_info['user_id'],
                                              project=sprint)
            developer_rate = rate.billable_amount
            developer_rate_with_commission = float(developer_rate) * float((1+(sprint.commission_percentage/100)))
            developer_velocity_adjusted_hours = float((user_estimate_info['total_hours'] or 0)) * float((rate.velocity or 1))
            developer_cost = float(developer_velocity_adjusted_hours) * float(developer_rate)
            
            tester_adjusted_hours = float(developer_velocity_adjusted_hours) * float(sprint.ratio_testing)
            tester_rate = Rate.objects.filter(project=sprint,
                                              time_tracking_mode='tester')\
                                      .aggregate(Avg('billable_amount'))['billable_amount__avg'] or 0
            tester_rate_with_commission = float(tester_rate) * float((1+(sprint.commission_percentage/100)))
            tester_cost = float(tester_adjusted_hours) * float(tester_rate_with_commission)
            

            manager_adjusted_hours = float(developer_velocity_adjusted_hours) * float(sprint.ratio_management)
            manager_rate = Rate.objects.filter(project=sprint,
                                               time_tracking_mode='manager')\
                                       .aggregate(Avg('billable_amount'))['billable_amount__avg'] or 0
            manager_rate_with_commission = float(manager_rate) * float((1+(sprint.commission_percentage/100)))
            manager_cost = float(manager_adjusted_hours) * float(manager_rate_with_commission)

            working_cost = developer_cost + tester_cost + manager_cost
            total_cost = working_cost * (1+sprint.ratio_scope_creep)

            estimates[user_estimate_info['user_id']] = { 'user_id': user_estimate_info['user_id'],
                                                         'developer_original_hours': user_estimate_info['total_hours'],
                                                         'developer_velocity': rate.velocity,
                                                         'developer_adjusted_hours': developer_velocity_adjusted_hours,
                                                         'developer_rate': developer_rate,
                                                         'developer_rate_with_commission': developer_rate_with_commission,
                                                         'developer_cost': developer_cost,
                                                         'tester_ratio': sprint.ratio_testing,
                                                         'tester_adjusted_hours': tester_adjusted_hours,
                                                         'tester_rate': tester_rate,
                                                         'tester_rate_with_commission': tester_rate_with_commission,
                                                         'tester_cost': tester_cost,
                                                         'manager_ratio': sprint.ratio_management,
                                                         'manager_adjusted_hours': manager_adjusted_hours,
                                                         'manager_rate': manager_rate,
                                                         'manager_rate_with_commission': manager_rate_with_commission,
                                                         'manager_cost': manager_cost,
                                                         'working_cost': working_cost,
                                                         'ratio_scope_creep': sprint.ratio_scope_creep,
                                                         'total_cost': total_cost }
        return estimates

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
        for user_id, estimates in data['comparative_estimates'].items():
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
    
