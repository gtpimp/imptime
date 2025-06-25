import logging
from company_problem_serializer import CompanyProblemSerializer
from rest_framework.decorators import list_route
import math
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from django.db.models import Count
from django.conf import settings
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from imptime.company_problem_calculator import CompanyProblemCalculator

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class CompanyProblemViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})
            ordering = params.get('ordering', {})

            company_problems = self.allowed_company_problems().order_by("sprint__business_id", "sprint_id", "problem_type")
            company_problems = self._filter_important_problems(company_problems)
            company_problems = self.apply_filter(qs=company_problems, raw_filter_args=filter_args)
            company_problems = self.apply_ordering(qs=company_problems, ordering=ordering)
            company_problems = self.apply_pagination(qs=company_problems, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x.id) for x in company_problems]
            else:
                s = CompanyProblemSerializer(company_problems, many=True)
                company_problems_data = s.data
                context['company_problems'] = company_problems_data
            context['pagination'] = pagination
            data = {'status': 'success',
                    'payload': context,
                    'nested_objects': {
                        'project_ids': [x.sprint.business_id for x in company_problems],
                        'sprint_ids': [x.sprint_id for x in company_problems if x.sprint_id is not None],
                        'user_ids': [x.user_id for x in company_problems if x.user_id is not None]
                    }
            }
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def _filter_important_problems(self, company_problems):
        return company_problems
    
    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params['value']

            if 'company_problem_ids' in params:
                company_problem_pks = params['company_problem_ids']
            else:
                company_problem_pks = [pk]

            for company_problem_pk in company_problem_pks:
                company_problem = self.allowed_company_problems().get(pk=company_problem_pk)
                if company_problem.money_sensitive and not self.logged_in_permissions(company_problem.project).can_view_ctc_billable_rates:
                    continue
                
                if field_name == 'status':
                    company_problem.status = new_value
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                company_problem.save()

            data = {'status': 'success',
                    'payload': { 'items': company_problem_pks }}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
    
    @list_route(methods=['POST'])
    def recalculate(self, request):
        try:
            CompanyProblemCalculator().refresh_all(projects=self.allowed_projects())
            data = {'status': 'success'}
            return HttpResponse(JSONRenderer().render(data))
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
