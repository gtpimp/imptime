from django import forms
from invoicing import models

class ClientInvoiceDetailsForm(forms.ModelForm):
    class Meta:
        model = models.ClientInvoiceDetails
        
    