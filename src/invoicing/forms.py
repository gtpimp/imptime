from django import forms
from invoicing import models
from django.forms.models import modelformset_factory
from dateutil.relativedelta import relativedelta
from datetime import datetime
from django.conf import settings

class ClientInvoiceDetailsForm(forms.ModelForm):
    class Meta:
        model = models.ClientInvoiceDetails
        
    
class InvoiceForm(forms.ModelForm):
    class Meta:
        model = models.Invoice
        fields = [ 'client', 'invoice_number', 'status', 'payment_due', 'invoice_note', 'footer_terms' ]

    def __init__(self, *args, **kwargs):
        super(InvoiceForm, self).__init__(*args, **kwargs)
        self.fields['invoice_number'].initial = models.Invoice.next_invoice_number()
        self.fields['payment_due'].initial = datetime.today() + relativedelta(settings.INVOICE_PAYMENT_DAYS)
        self.fields['payment_due'].widget.attrs['class'] = 'date_field'

class InvoiceItemForm(forms.ModelForm):
    class Meta:
        model = models.InvoiceItem
        fields = [ 'num_units', 'unit_cost', 'description' ]

invoice_item_formset = modelformset_factory(models.InvoiceItem, form=InvoiceItemForm, can_delete=True, extra=5)