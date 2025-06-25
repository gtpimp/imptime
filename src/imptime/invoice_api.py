import logging
from invoice_serializer import InvoiceSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Project as Sprint
from timepiece.models import Business as Project
from timepiece.models import BusinessPermissions as ProjectPermissions
from invoicing.models import Invoice, InvoiceItem
from imptime.models import SprintTemplate
from rest_framework.decorators import detail_route

logger = logging.getLogger(__name__)

# Sprints are weird: They use the timepiece.Project model for legacy
# reasons. This api renames the model to Sprint in the import, but
# functions on the model will still refer to project. This is noted
# with 'sic' where it could be surprising.

@permission_classes((IsAuthenticated,))
class InvoiceViewSet(BaseViewSet):

    def list(self, request):

        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})
            invoices = self.allowed_invoices().order_by("-payment_due")
            invoices = self.apply_filter(qs=invoices, raw_filter_args=filter_args)
            invoices = self.apply_pagination(qs=invoices, pagination=pagination)
            
            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in invoices.values_list('id', flat=True)]
            else:
                s = InvoiceSerializer(invoices, many=True)
                invoices_data = s.data
                context['invoices'] = invoices_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
