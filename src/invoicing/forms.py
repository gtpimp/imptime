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
        exclude = []

class InvoiceForm(forms.ModelForm):

    class Meta:
        model = models.Invoice
        fields = [ 'client', 'project', 'business', 'invoice_number', 'internal_comment', 'client_order_name', 'client_order_number', 'status',
                   'issued_at', 'payment_due', 'invoice_note', 'footer_terms' ]

    project = GroupedModelChoiceField('business', required=False, queryset=timepiece.Project.objects.filter(business__archived=False).order_by("business__name", "name"))

    def __init__(self, *args, **kwargs):
        super(InvoiceForm, self).__init__(*args, **kwargs)
        self.fields['invoice_number'].initial = models.Invoice.next_invoice_number()
        self.fields['issued_at'].initial = datetime.today()
        self.fields['issued_at'].widget.attrs['class'] = 'date_field'
        self.fields['payment_due'].initial = datetime.today() + relativedelta(days=settings.INVOICE_PAYMENT_DAYS)
        self.fields['payment_due'].widget.attrs['class'] = 'date_field'
        self.fields['issued_at'].initial = datetime.today()
        self.fields['client'].queryset = models.ClientInvoiceDetails.objects.filter(invoices__business__archived=False).order_by("name").distinct()
        self.fields['business'].queryset = timepiece.Business.objects.filter(archived=False).order_by("name")

class InvoiceItemForm(forms.ModelForm):

    class Meta:
        model = models.InvoiceItem
        fields = [ 'num_units', 'unit_cost', 'description', 'order' ]

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
    project = GroupedModelChoiceField('business', required=False, queryset=timepiece.Project.objects.all().filter_open().order_by("business__name", "name"))
    status = forms.ChoiceField(required=False, choices=( ('all', 'All'),) + models.Invoice.INVOICE_STATUSES)
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
        if data['project']:
            qs = qs.filter(project=data['project'])
        if data['status'] and data['status'] != 'all':
            qs = qs.filter(status=data['status'])
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

class QuoteFilterForm(forms.Form):

    client = forms.ModelChoiceField(required=False, queryset=models.ClientInvoiceDetails.objects.order_by("name"))
    project = GroupedModelChoiceField('business', required=False, queryset=timepiece.Project.objects.all().filter_open().order_by("business__name", "name"))
    status = forms.ChoiceField(required=False, choices=( ('all', 'All'),) + models.Quote.QUOTE_STATUSES)
    sent_to_client_from = forms.DateField(required=False)
    sent_to_client_to = forms.DateField(required=False)
    accepted_from = forms.DateField(required=False)
    accepted_to = forms.DateField(required=False)

    def __init__(self, *args, **kwargs):
        super(QuoteFilterForm, self).__init__(*args, **kwargs)
        self.fields['sent_to_client_from'].widget.attrs['class'] = 'date_field'
        self.fields['sent_to_client_to'].widget.attrs['class'] = 'date_field'
        self.fields['accepted_from'].widget.attrs['class'] = 'date_field'
        self.fields['accepted_to'].widget.attrs['class'] = 'date_field'

    def filter(self, qs):
        data = self.cleaned_data
        if data['client']:
            qs = qs.filter(client=data['client'])
        if data['project']:
            qs = qs.filter(project=data['project'])
        if data['status'] and data['status'] != 'all':
            qs = qs.filter(status=data['status'])
        if data['sent_to_client_from']:
            qs = qs.filter(sent_to_client_at__gte=data['sent_to_client_from'])
        if data['sent_to_client_to']:
            qs = qs.filter(sent_to_client_at__lte=data['sent_to_client_to'])
        if data['accepted_from']:
            qs = qs.filter(accepted_at__gte=data['accepted_from'])
        if data['accepted_to']:
            qs = qs.filter(accepted_at__lte=data['accepted_to'])
        return qs

class QuoteForm(forms.ModelForm):


    class Meta:
        model = models.Quote
        fields = [ 'status', 'project', 'internal_comment',
                   'sent_to_client_at', 'accepted_at', 'amount', 'currency_symbol',
                   'quote_document', 'additional_document' ]

    project = GroupedModelChoiceField('business', required=False, queryset=timepiece.Project.objects.all().filter_open().order_by("business__name", "name"))
    update_sprint_budget = forms.BooleanField(initial=True, required=False)

    def __init__(self, *args, **kwargs):
        defaults = { 'status': 'sent to client',
                     'sent_to_client_at' : datetime.today() }
        defaults.update(kwargs.get('initial', {}))
        kwargs['initial']=defaults

        super(QuoteForm, self).__init__(*args, **kwargs)
        self.fields['sent_to_client_at'].widget.attrs['class'] = 'date_field'
        self.fields['accepted_at'].widget.attrs['class'] = 'date_field'

        if self.instance and self.instance.project:
            docs = timepiece.BusinessDocument.objects.filter(project=self.instance.project)
        elif kwargs['initial'].get('project', None):
            docs = timepiece.BusinessDocument.objects.filter(project=kwargs['initial']['project'])
        else:
            docs = None

        if docs:
            self.fields['quote_document'].queryset = docs
            self.fields['quote_document'].options = [ (doc.id, doc.filename) for doc in docs ]


class StatementFilterForm(forms.Form):

    client = forms.ModelChoiceField(
        required=False,
        queryset=models.ClientInvoiceDetails.objects.order_by("name"))
    issued_from = forms.DateField(required=False)
    issued_to = forms.DateField(required=False)

    def __init__(self, *args, **kwargs):
        super(StatementFilterForm, self).__init__(*args, **kwargs)
        self.fields['issued_from'].widget.attrs['class'] = 'date_field'
        self.fields['issued_to'].widget.attrs['class'] = 'date_field'

    def filter(self, qs):
        data = self.cleaned_data
        if data['client']:
            qs = qs.filter(client=data['client'])
        if data['issued_from']:
            qs = qs.filter(issued_at__gte=data['issued_from'])
        if data['issued_to']:
            qs = qs.filter(issued_at__lte=data['issued_to'])
        return qs
