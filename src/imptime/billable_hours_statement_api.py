import logging
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import detail_route
from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.http import HttpResponse
from lib import file_helper
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, FloatField, Sum, F, ExpressionWrapper
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions, Entry, Rate
from django.contrib.auth.models import User
from imptime.authentication import FormTokenAuthenticated
from invoicing.models import Invoice
from billable_hours_statement_serializer import BillableHoursStatementFilterSerializer
import csv

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class BillableHoursStatementViewSet(BaseViewSet):

    def retrieve(self, request, pk):
        try:
            params = request.GET.get('params', '{}')
            params = json.loads(params)

            if params:
                date_from_inclusive = params['filter']['date_from_inclusive']
                date_to_inclusive = params['filter']['date_to_inclusive']
            else:
                date_from_inclusive = datetime.now()-relativedelta(years=50)
                date_to_inclusive = datetime.now()+relativedelta(years=50)

            billable_hours_statement = self._get_data(date_from_inclusive=date_from_inclusive,
                                                      date_to_inclusive=date_to_inclusive)

            data = {'status': 'success', 'payload': { 'billable_hours_statement': billable_hours_statement}}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _get_data(self, date_from_inclusive, date_to_inclusive):
        res = {}

        projects = self.allowed_projects_for_money(self.allowed_projects())
        entries = Entry.objects.filter(issue__project__business__in=projects,
                                       end_time__gte=date_from_inclusive,
                                       end_time__lte=date_to_inclusive)
        res['by_project'] = self._get_billable_hours(entries)

        res['all_user_ids'] = [x for x in entries.values_list("user_id", flat=True).distinct() if x]
        res['all_sprint_ids'] = [x for x in entries.values_list("issue__project_id", flat=True).distinct() if x] #sic
        res['all_project_ids'] = [x for x in entries.values_list("issue__project__business_id", flat=True).distinct() if x] #sic
        
        return res

    def _get_billable_hours(self, entries):
        entries = entries.order_by("issue__project__business__name", "issue__project__name", "user__username")
        entries = entries.annotate(project_id=F("issue__project__business_id"),
                                   sprint_id=F("issue__project_id"))
        entries = entries.values("project_id", "sprint_id", "user_id")
        #entries = entries.annotate(business_invoice=F("issue__project__business__invoices"), project_invoice=F("issue__project__invoices"))

        import pdb; pdb.set_trace()
        
        entries = entries.annotate(sum_hours=Sum('hours'),
                                   cost=Sum(F('hours')*F('user__rates__billable_amount')),
                                   cost_with_commission=Sum(F('hours')*F('user__rates__billable_amount')*100/(100-F('user__rates__project__commission_percentage')),
                                                            output_field=FloatField()))
        

        return entries
    
