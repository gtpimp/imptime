#-*- coding: utf-8 -*-
from django.conf import settings
from django.db.models.query import QuerySet
from django.contrib.auth.models import User
from timepiece.model_managers import QuerySetManager
from django.db.models import Sum, Count, Q, F, Max, Min
from django.db import models
from datetime import datetime, date

class ClientInvoiceDetails(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    address1 = models.CharField(max_length=255, null=True, blank=True)
    address2 = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)
    postal_code = models.CharField(max_length=255, null=True, blank=True)
    vat_number = models.CharField(max_length=30, null=True, blank=True)
    taxable = models.BooleanField(default=True, blank=True)
    filename_prefix = models.CharField(max_length=30, null=False, blank=False)

    contact_first_name = models.CharField(max_length=255, null=True, blank=True)
    contact_last_name = models.CharField(max_length=255, null=True, blank=True)
    contact_email = models.CharField(max_length=255, null=True, blank=True)
    contact_phone = models.CharField(max_length=255, null=True, blank=True)

    def __unicode__(self):
        return self.name

class InvoiceQuerySet(QuerySet):
    def cost_with_vat(self):
        return self.aggregate(Sum('items__total_cost'))['items__total_cost__sum'] * (1+settings.INVOICE_DETAILS['vat_rate'])

    def cost(self):
        return self.aggregate(Sum('items__total_cost'))['items__total_cost__sum']

    def amount_paid(self):
        return self.aggregate(Sum('payments__amount'))['payments__amount__sum']

    def amount_owed(self):
        return self.cost_with_vat()-self.amount_paid()

    def currency_symbol(self):
        if self.count()>0:
            return self[0].currency_symbol
        else:
            return ''

class Invoice(models.Model):

    INVOICE_STATUSES = (('open', 'Open'), ('paid', 'Paid'), ('cancelled', 'Cancelled'))

    objects = QuerySetManager(InvoiceQuerySet)

    client = models.ForeignKey(ClientInvoiceDetails, blank=False, null=False)
    internal_comment = models.TextField(blank=True, null=True, verbose_name="Comment (doesn't appear on the invoice")
    project = models.ForeignKey("timepiece.Project", blank=False, null=False)
    invoice_number = models.IntegerField(default=0, null=False, blank=False)
    client_order_name = models.CharField(max_length=50, null=True, blank=True, verbose_name="Optional client order name")
    client_order_number = models.CharField(max_length=50, null=True, blank=True, verbose_name="Optional client order number")
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    invoice_note = models.CharField(max_length=255, null=True, blank=True)
    issued_at = models.DateField()
    payment_due = models.DateField()
    currency_symbol = models.CharField(max_length=3, blank=False, null=False, default="R", 
                                       choices=( ("R", "R"), ("£","£"), ("€","€") ))
    footer_terms = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default='open', blank=False, null=False, choices=INVOICE_STATUSES)

    @classmethod
    def next_invoice_number(self):
        return (Invoice.objects.all().aggregate(Max('invoice_number'))['invoice_number__max'] or 0)+1

    @property
    def is_overdue(self):
        return self.status == 'open' and date.today() > self.payment_due

    @property
    def days_till_due(self):
        return (self.payment_due - date.today()).days

    @property
    def days_overdue(self):
        return -self.days_till_due

    @property
    def items_in_order(self):
        return self.items.all().order_by("pk")

    @property
    def cost(self):
        return self.items.all().aggregate(Sum('total_cost'))['total_cost__sum']

    @property
    def vat(self):
        return self.cost * settings.INVOICE_DETAILS['vat_rate']

    @property
    def cost_with_vat(self):
        return self.cost + self.vat

    @property
    def amount_paid(self):
        return self.payments.all().aggregate(Sum('amount'))['amount__sum'] or 0

    @property
    def amount_owed(self):
        return self.cost_with_vat - self.amount_paid
    

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, blank=False, null=False, related_name='items')
    num_units = models.FloatField(blank=False, null=False)
    unit_cost = models.FloatField(null=False, blank=False)
    total_cost = models.FloatField(null=False, blank=False)
    description = models.CharField(max_length=255, null=False, blank=False)

    def save(self, *args, **kwargs):
        self.total_cost = (self.unit_cost or 0) * (self.num_units or 0)
        super(InvoiceItem, self).save(*args, **kwargs)
    
class InvoicePayment(models.Model):
    invoice = models.ForeignKey(Invoice, blank=False, null=False, related_name='payments')
    amount = models.FloatField(null=False, blank=False)
    paid_at = models.DateField(null=False, blank=False)
    description = models.CharField(max_length=255, null=True, blank=True)

