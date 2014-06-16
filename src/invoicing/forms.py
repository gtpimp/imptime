from django import forms
from invoicing import models
from django.forms.models import modelformset_factory
from invoicing.fields import GroupedModelChoiceField
from dateutil.relativedelta import relativedelta
from datetime import datetime
from django.conf import settings
from timepiece import models as timepiece

class ClientInvoiceDetailsForm(forms.ModelForm):
    class Meta:
        model = models.ClientInvoiceDetails
    
class InvoiceForm(forms.ModelForm):

    class Meta:
        model = models.Invoice
        fields = [ 'client', 'project', 'invoice_number', 'internal_comment', 'client_order_name', 'client_order_number', 'status', 
                   'issued_at', 'payment_due', 'invoice_note', 'footer_terms' ]

    project = GroupedModelChoiceField('business', required=False, queryset=timepiece.Project.objects.all().filter_open().order_by("business__name", "name"))

    def __init__(self, *args, **kwargs):
        super(InvoiceForm, self).__init__(*args, **kwargs)
        self.fields['invoice_number'].initial = models.Invoice.next_invoice_number()
        self.fields['issued_at'].initial = datetime.today()
        self.fields['issued_at'].widget.attrs['class'] = 'date_field'
        self.fields['payment_due'].initial = datetime.today() + relativedelta(days=settings.INVOICE_PAYMENT_DAYS)
        self.fields['payment_due'].widget.attrs['class'] = 'date_field'
        self.fields['issued_at'].initial = datetime.today()

class InvoiceItemForm(forms.ModelForm):
    class Meta:
        model = models.InvoiceItem
        fields = [ 'num_units', 'unit_cost', 'description' ]

invoice_item_formset = modelformset_factory(models.InvoiceItem, form=InvoiceItemForm, can_delete=True, extra=5)

class InvoicePaymentForm(forms.ModelForm):
    class Meta:
        model = models.InvoicePayment
        fields = [ 'amount', 'paid_at', 'description' ]

    def __init__(self, *args, **kwargs):
        super(InvoicePaymentForm, self).__init__(*args, **kwargs)
        self.fields['paid_at'].widget.attrs['class'] = 'date_field'

invoice_payment_formset = modelformset_factory(models.InvoicePayment, form=InvoicePaymentForm, can_delete=True, extra=1)

class InvoiceFilterForm(forms.Form):
    
    client = forms.ModelChoiceField(required=False, queryset=models.ClientInvoiceDetails.objects.order_by("name"))
    status = forms.ChoiceField(required=False, choices=( ('all', 'All (except cancelled)'),) + models.Invoice.INVOICE_STATUSES)
    invoice_number = forms.IntegerField(required=False)
    overdue = forms.ChoiceField(required=False, choices=( ('all', 'All'), ('overdue', 'Overdue'), ('not_overdue', 'Not overdue')) )
    issued_from = forms.DateField(required=False)
    issued_to = forms.DateField(required=False)
    payment_due_from = forms.DateField(required=False)
    payment_due_to = forms.DateField(required=False)

    def __init__(self, *args, **kwargs):
        super(InvoiceFilterForm, self).__init__(*args, **kwargs)
        self.fields['issued_from'].widget.attrs['class'] = 'date_field'
        self.fields['issued_to'].widget.attrs['class'] = 'date_field'
        self.fields['payment_due_from'].widget.attrs['class'] = 'date_field'
        self.fields['payment_due_to'].widget.attrs['class'] = 'date_field'

    def filter(self, qs):
        data = self.cleaned_data
        if data['client']:
            qs = qs.filter(client=data['client'])
        if data['status'] and data['status'] != 'all':
            qs = qs.filter(status=data['status'])
        else:
            qs = qs.exclude(status='cancelled')
        if data['invoice_number']:
            qs = qs.filter(invoice_number=data['invoice_number'])
        if data['overdue']=='overdue':
            qs = qs.filter(payment_due__lte=datetime.today())
            qs = qs.filter(status='open')
        elif data['overdue']=='not_overdue':
            qs = qs.filter(payment_due__gt=datetime.today())
        if data['issued_from']:
            qs = qs.filter(issued_at__gte=data['issued_from'])
        if data['issued_to']:
            qs = qs.filter(issued_at__lte=data['issued_to'])
        if data['payment_due_from']:
            qs = qs.filter(payment_due__gte=data['payment_due_from'])
        if data['payment_due_to']:
            qs = qs.filter(payment_due__lte=data['payment_due_to'])
        return qs
