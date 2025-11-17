import logging
from rest_framework import serializers
from .base_serializer import BaseSerializer
logger = logging.getLogger(__name__)

class InvoiceItemSerializer(BaseSerializer):
    id = serializers.CharField()
    num_units = serializers.IntegerField()
    unit_cost = serializers.FloatField()
    total_cost = serializers.FloatField()
    description = serializers.CharField()
    
class InvoiceSerializer(BaseSerializer):
    id = serializers.CharField()
    items = serializers.ListField(child=InvoiceItemSerializer(), source="items_in_order")
    client_name = serializers.CharField(source="client.name")
    internal_comment = serializers.CharField()
    sprint_id = serializers.CharField(source="project_id") #sic
    project_id = serializers.CharField(source="business_id") #sic
    invoice_number = serializers.IntegerField()
    client_order_name = serializers.CharField()
    client_order_number = serializers.CharField()
    created = serializers.DateTimeField()
    invoice_note = serializers.CharField()
    issued_at = serializers.DateTimeField()
    payment_due = serializers.DateTimeField()
    currency_symbol = serializers.CharField()
    footer_terms = serializers.CharField()
    status = serializers.CharField()
    is_overdue = serializers.BooleanField()
    vat = serializers.FloatField()
    paid_at = serializers.DateTimeField()
    cost_ex_vat = serializers.FloatField(source="cost")
    cost_with_vat = serializers.FloatField()
    amount_paid = serializers.FloatField()
    amount_written_off = serializers.FloatField()
    amount_owed = serializers.FloatField()
    
