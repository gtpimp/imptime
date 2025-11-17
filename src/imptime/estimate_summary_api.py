import logging
from datetime import datetime
import csv
from rest_framework.decorators import detail_route
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from .base_api import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Project as Sprint
from .estimate_summary_calculator import EstimateSummaryCalculator
logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class EstimateSummaryViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            sprint_id = pk
            calculator = EstimateSummaryCalculator()
            estimate_summary = calculator.get_data(user=request.user, sprint_id=sprint_id)
            data = {"status": "success", "payload": { 'estimate_summary': estimate_summary }}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))


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
        calculator = EstimateSummaryCalculator()
        data = calculator.get_data(user=request.user, sprint_id=sprint.id)

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

