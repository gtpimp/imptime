from django.conf import settings
from django.contrib.auth.models import User
from django.db import models

class ClientInvoiceDetails(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    address1 = models.CharField(max_length=255, null=False, blank=False)
    address2 = models.CharField(max_length=255, null=False, blank=False)
    city = models.CharField(max_length=255, null=False, blank=False)
    province = models.CharField(max_length=255, null=False, blank=False)
    country = models.CharField(max_length=255, null=False, blank=False)
    postal_code = models.CharField(max_length=255, null=False, blank=False)
    taxable = models.BooleanField(default=True, blank=True)

    contact_title = models.CharField(max_length=255, null=False, blank=False)
    contact_first_name = models.CharField(max_length=255, null=False, blank=False)
    contact_last_name = models.CharField(max_length=255, null=False, blank=False)
    contact_email = models.CharField(max_length=255, null=False, blank=False)
    contact_phone = models.CharField(max_length=255, null=False, blank=False)

class Invoice(models.Model):
    client = models.ForeignKey(ClientInvoiceDetails, blank=False, null=False)
    invoice_number = models.IntegerField(default=0, null=False, blank=False)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    invoice_note = models.TextField(null=True, blank=True)
    payment_due = models.DateTimeField()
    footer_terms = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default='open', blank=False, null=False,
                              choices=( ('open', 'Open'), ('paid', 'Paid'), ('cancelled', 'Cancelled') ))

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, blank=False, null=False)
    num_units = models.FloatField(blank=False, null=False)
    unit_cost = models.FloatField(null=False, blank=False)
    description = models.CharField(max_length=255, null=False, blank=False)

    @property
    def cost(self):
        return self.num_units * self.unit_cost

class InvoicePayment(models.Model):
    invoice = models.ForeignKey(Invoice, blank=False, null=False)
    amount = models.FloatField(null=False, blank=False)
    paid_at = models.DateTimeField(auto_now_add=True)
