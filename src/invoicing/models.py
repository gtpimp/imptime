#-*- coding: utf-8 -*-
from django.conf import settings
from lib.fields import ProtectedForeignKey
from django.db.models.query import QuerySet
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q, F, Max, Min
from django.db import models
from datetime import datetime, date
from lib.fields import UploadTo
from timepiece.models import BusinessPermissions

CURRENCY_SYMBOLS = ( ("R", "R"), ("£","£"), ("€","€"), ("bitcoin","B") )

upload_to_additional_documents = UploadTo("quotes_additional_documents")

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
    archived = models.BooleanField(default=False, db_index=True)

    def __unicode__(self):
        return self.name

    @classmethod
    def get_for_business(self, business):
        return ClientInvoiceDetails.objects.filter(invoices__business=business).order_by("-id").first()


class InvoiceQuerySet(QuerySet):

    def filter_by_logged_in_user(self, user):
        """ restricts entries to those belonging to projects the given
        user (typically the logged in user) is assigned to """

        # Hack, debugging permission problem
        return Invoice.objects.all()

        # invoices_for_my_businesses = (Q(business__in=BusinessPermissions.active_businesses_for_user(user))|\
        #                               Q(project__business__in=BusinessPermissions.active_businesses_for_user(user)))&\
        #                              Q(business__business_permissions__user=user)&\
        #                              Q(business__business_permissions__can_view_invoices=True)

        # return self.filter(invoices_for_my_businesses)
    
    def cost_with_vat(self):
        return (self.filter(client__taxable=True).annotate(cost_with_vat=Sum('items__total_cost')*(1+F('vat_rate'))).aggregate(total_cost_with_vat=Sum('cost_with_vat'))['total_cost_with_vat'] or 0) + \
               (self.filter(client__taxable=False).aggregate(Sum('items__total_cost'))['items__total_cost__sum'] or 0)

    def vat(self):
        return (self.cost_with_vat() or 0) - (self.cost() or 0)

    def cost(self):
        return self.aggregate(Sum('items__total_cost'))['items__total_cost__sum']

    def amount_paid(self):
        return self.aggregate(Sum('payments__amount'))['payments__amount__sum'] or 0

    def amount_written_off(self):
        return self.filter(status='writtenoff').cost_with_vat()

    def amount_owed(self):
        return self.cost_with_vat()-self.amount_paid()-self.amount_written_off()

    def currency_symbol(self):
        if self.count()>0:
            return self[0].currency_symbol
        else:
            return ''

class Invoice(models.Model):

    INVOICE_STATUSES = (('open', 'Open'), ('paid', 'Paid'), ('writtenoff', 'Written Off'))

    objects = InvoiceQuerySet.as_manager()

    from_company = ProtectedForeignKey("timepiece.Company", blank=False, null=False, related_name='invoices')
    client = models.ForeignKey(ClientInvoiceDetails, blank=False, null=False, related_name='invoices', on_delete=models.CASCADE)
    internal_comment = models.TextField(blank=True, null=True, verbose_name="Comment (doesn't appear on the invoice")
    business = models.ForeignKey("timepiece.Business", blank=True, null=False, related_name='invoices', on_delete=models.CASCADE)
    project = models.ForeignKey("timepiece.Project", blank=True, null=True, related_name='invoices', on_delete=models.CASCADE)
    invoice_number = models.IntegerField(default=0, null=False, blank=False, unique=True)
    client_order_name = models.CharField(max_length=50, null=True, blank=True, verbose_name="Optional client order name")
    client_order_number = models.CharField(max_length=50, null=True, blank=True, verbose_name="Optional client order number")
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    invoice_note = models.CharField(max_length=255, null=True, blank=True)
    issued_at = models.DateField()
    payment_due = models.DateField()
    currency_symbol = models.CharField(max_length=3, blank=False, null=False, default="R", choices=CURRENCY_SYMBOLS)
    footer_terms = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default='open', blank=False, null=False, choices=INVOICE_STATUSES)
    vat_rate = models.FloatField(default=0)
    created_by = ProtectedForeignKey(User, related_name='invoices_created_by', null=True)
                                                                                       
    def save(self, *args, **kwargs):
        if self.project is not None:
            self.business = self.project.business

        if self.id is None:
            if self.client.taxable:
                self.vat_rate = settings.INVOICE_DETAILS['vat_rate'] or 0
            else:
                self.vat_rate = 0
                
        super(Invoice, self).save(*args, **kwargs)

    @classmethod
    def next_invoice_number(self):
        return (Invoice.objects.all()\
                .aggregate(Max('invoice_number'))['invoice_number__max'] or 0)+1

    @property
    def is_overdue(self):
        return self.status == 'open' and date.today() > self.payment_due

    @property
    def vat_rate_percentage(self):
        return self.vat_rate*100

    @property
    def vat(self):
        return (self.cost_with_vat or 0) - (self.cost or 0)
    
    @property
    def days_paid_ago(self):
        paid_at = self.paid_at
        if paid_at is None:
            return None
        return (date.today() - self.payments.aggregate(Max("paid_at"))['paid_at__max']).days

    @property
    def paid_at(self):
        if self.status != 'paid':
            return None
        else:
            return self.payments.aggregate(Max("paid_at"))['paid_at__max']

    @property
    def days_till_due(self):
        return (self.payment_due - date.today()).days

    @property
    def days_overdue(self):
        return -self.days_till_due

    @property
    def items_in_order(self):
        return self.items.all().order_by("order", "pk")

    @property
    def cost(self):
        return self.items.all().aggregate(Sum('total_cost'))['total_cost__sum']

    @property
    def cost_with_vat(self):
        return (self.cost or 0) * (1+self.vat_rate)

    @property
    def amount_paid(self):
        return self.payments.all().aggregate(Sum('amount'))['amount__sum'] or 0

    @property
    def amount_written_off(self):
        if self.is_written_off:
            return self.cost_with_vat
        else:
            return 0

    @property
    def is_written_off(self):
        return self.status == 'writtenoff'

    @property
    def amount_owed(self):
        if self.is_written_off:
            return 0
        else:
            return self.cost_with_vat - self.amount_paid


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, blank=False, null=False, related_name='items', on_delete=models.CASCADE)
    num_units = models.FloatField(blank=False, null=False)
    unit_cost = models.FloatField(null=False, blank=False)
    total_cost = models.FloatField(null=False, blank=False)
    description = models.CharField(max_length=255, null=False, blank=False)
    order = models.IntegerField(default=0, null=True, blank=True)

    def save(self, *args, **kwargs):
        self.total_cost = (self.unit_cost or 0) * (self.num_units or 0)
        super(InvoiceItem, self).save(*args, **kwargs)


class InvoicePayment(models.Model):
    invoice = models.ForeignKey(Invoice, blank=False, null=False, related_name='payments', on_delete=models.CASCADE)
    amount = models.FloatField(null=False, blank=False)
    paid_at = models.DateField(null=False, blank=False)
    description = models.CharField(max_length=255, null=True, blank=True)


class QuoteQuerySet(QuerySet):

    def amount(self):
        return self.aggregate(Sum('amount'))['amount__sum']

    def quotes_waiting(self):
        return self.filter(status='sent to client')

    def amount_waiting(self):
        return self.quotes_waiting().aggregate(Sum('amount'))['amount__sum']

    def quotes_accepted(self):
        return self.filter(status='accepted')

    def amount_accepted(self):
        return self.quotes_accepted().aggregate(Sum('amount'))['amount__sum']

class Quote(models.Model):
    QUOTE_STATUSES = ( ('creating', 'Creating'), ('sent to client', 'Sent to client'), ('accepted', 'Accepted by client'), ('rejected', 'Rejected by client'), ('work done', 'Work done') )
    objects = QuoteQuerySet.as_manager()
    internal_comment = models.TextField(blank=True, null=True, verbose_name="Comment (not sent to the client)")
    project = models.ForeignKey("timepiece.Project", blank=True, null=True, related_name='quotes', on_delete=models.SET_NULL)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    sent_to_client_at = models.DateField(null=True, blank=True)
    accepted_at = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default='open', blank=False, null=False, choices=QUOTE_STATUSES)
    amount = models.IntegerField(null=True, blank=True) # in rands
    currency_symbol = models.CharField(max_length=3, blank=False, null=False, default="R", choices=CURRENCY_SYMBOLS)
    quote_document = models.ForeignKey("timepiece.BusinessDocument", blank=True, null=True, on_delete=models.SET_NULL)
    additional_document = models.FileField(max_length=255, upload_to=upload_to_additional_documents, null=True, blank=True)

    @property
    def is_sent(self):
        return self.sent_to_client_at

    @property
    def is_accepted(self):
        return self.accepted_at and self.status == 'accepted'

    @property
    def amount_waiting(self):
        if self.status == 'sent to client':
            return self.amount
        else:
            return None

    @property
    def amount_accepted(self):
        if self.is_accepted:
            return self.amount
        else:
            return None
