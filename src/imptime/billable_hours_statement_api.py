import logging
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import detail_route
from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.http import HttpResponse
from lib import file_helper
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
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
        billable_hours_statement = {}

        projects = self.allowed_projects_for_money()
        entries = Entry.objects.filter(issue__project__business__in=projects,
                                       end_time__gte=date_from_inclusive,
                                       end_time__lte=date_to_inclusive)
        self._get_billable_hours(entries)
        
        return billable_hours_statement

    def _get_billable_hours(self, entries):
        import pdb; pdb.set_trace()
        pass
