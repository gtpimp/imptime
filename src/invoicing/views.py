from invoicing import models
from django.db.models import Sum, Count, Q, F, Max, Min
from lib.file_helper import download_media
import copy
from phantom_pdf.generator import create_url_from_query_dict, render_url_to_pdf
import datetime
from timepiece import models as timepiece
from django.core.files.base import ContentFile
from django.contrib.auth import login as django_login, load_backend
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth.decorators import login_required, permission_required
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse, resolve
from django.template import RequestContext
from django.contrib import messages
from forms import *
from timepiece import forms as timepiece_forms
import logging
logger = logging.getLogger(__name__)

@login_required
def clients(request, template="invoicing/clients.html", context=None):
    context = context or {}
    context['clients'] = models.ClientInvoiceDetails.objects.all().order_by("name")
    return render(request, template, context)

@login_required
def invoices(request, template="invoicing/invoices.html", context=None):
    context = context or {}

    bp = _get_best_bp(request)
    if not bp.has_view_invoices:
        raise PermissionDenied

    invoices = models.Invoice.objects.all().order_by("-created").filter_by_logged_in_user(request.user)
    filter_form = InvoiceFilterForm(request.GET or None)
    if filter_form.is_valid():
        invoices = filter_form.filter(invoices)

    context['invoices'] = invoices
    context['totals'] = context['invoices']
    context['filter_form'] = filter_form
    context['bp'] = bp
    return render(request, template, context)

@login_required
def new_client(request, template="invoicing/new_client.html", context=None):
    context = context or {}
    form = ClientInvoiceDetailsForm(request.POST or None)

    bp = _get_best_bp(request)
    if not bp.has_edit_invoices:
        raise PermissionDenied

    if form.is_valid():
        client = form.save()
        messages.info(request, "Client created")
        return HttpResponseRedirect(reverse('invoicing:edit_client', kwargs={'client_id':client.id}))

    context['form'] = form
    return render(request, template, context)

@login_required
def edit_client(request, client_id, template="invoicing/edit_client.html", context=None):
    context = context or {}
    client = models.ClientInvoiceDetails.objects.get(pk=client_id)
    form = ClientInvoiceDetailsForm(request.POST or None, instance=client)

    bp = _get_best_bp(request)
    if not bp.has_edit_invoices:
        raise PermissionDenied

    if form.is_valid():
        client = form.save()
        messages.info(request, "Client saved")
        return HttpResponseRedirect(reverse('invoicing:edit_client', kwargs={'client_id':client.id}))

    context['form'] = form
    context['client'] = client
    return render(request, template, context)

@login_required
def new_invoice(request, template="invoicing/new_invoice.html", context=None):
    context = context or {}

    bp = _get_best_bp(request)
    if not bp.has_edit_invoices:
        raise PermissionDenied

    form = InvoiceForm(request.POST or None)
    items_formset = invoice_item_formset(request.POST or None, prefix='items', queryset=models.InvoiceItem.objects.none())
    if form.is_valid() and items_formset.is_valid():
        invoice = form.save(commit=False)
        invoice.created_by=request.user
        invoice.from_company = timepiece.Company.objects.get(name="Implicit Design")
        invoice.save()
        form.save_m2m()
        items = items_formset.save(commit=False)
        item_count = 1
        for item in items:
            item.invoice = invoice
            if item.order == 0:
                item.order = item_count
                item_count += 1
            item.save()
        items_formset.save_m2m()
        messages.info(request, "Invoice created")
        return HttpResponseRedirect(reverse('invoicing:edit_invoice', kwargs={'invoice_id':invoice.id}))

    context['form'] = form
    context['items_formset'] = items_formset
    return render(request, template, context)

@login_required
def edit_invoice(request, invoice_id, template="invoicing/edit_invoice.html", context=None):
    context = context or {}
    invoice = models.Invoice.objects.filter_by_logged_in_user(request.user).get(pk=invoice_id)

    bp = _get_best_bp(request, invoice)

    # Hack permissions out
    # if not bp.has_edit_invoices:
    #     raise PermissionDenied

    form = InvoiceForm(request.POST or None, instance=invoice)
    items_formset = invoice_item_formset(request.POST or None, queryset = invoice.items_in_order, prefix='items')
    payments_formset = invoice_payment_formset(request.POST or None, queryset = invoice.payments.all().order_by("paid_at"), prefix='payments')

    if form.is_valid() and items_formset.is_valid() and payments_formset.is_valid():
        invoice = form.save()
        items = items_formset.save(commit=False)
        item_count = 1
        for item in items:
            item.invoice = invoice
            if item.order == 0:
                item.order = item_count
                item_count += 1
            item.save()
        for item in items_formset.deleted_objects:
            item.delete()
        items_formset.save_m2m()

        payments = payments_formset.save(commit=False)
        for payment in payments:
            payment.invoice = invoice
            fail_count = 0
            while True:
                try:
                    payment.save()
                    break
                except Exception as ex:
                    logger.warning("Getting integrity error during save, most likely a problem with sequences: %s" % ex)
                    fail_count += 1
                    if fail_count>200:
                        raise
        payments_formset.save_m2m()
        for payment in payments_formset.deleted_objects:
            payment.delete()

        messages.info(request, "Invoice updated")
        return HttpResponseRedirect(reverse('invoicing:edit_invoice', kwargs={'invoice_id':invoice.id}))

    context['summary_form'] = timepiece_forms.SprintInvoiceReportSettingsForm(
        invoice.project, bp,
        initial=timepiece_forms.SprintInvoiceReportSettingsForm.get_initial_data_for_priceless_summary())
    context['form'] = form
    context['items_formset'] = items_formset
    context['payments_formset'] = payments_formset
    context['invoice'] = invoice
    return render(request, template, context)

@login_required
def invoice_pay_in_full(request, invoice_id):
    invoice = models.Invoice.objects.filter_by_logged_in_user(request.user).get(pk=invoice_id)
    if invoice.amount_owed:
        invoice_payment = models.InvoicePayment.objects.create(
            invoice=invoice,
            amount=invoice.amount_owed,
            paid_at=datetime.today(),
            description='Paid in full'
        )
        messages.info(request, "Invoice paid in full")
    else:
        messages.info(request, "Invoice already paid in full")
    return HttpResponseRedirect(reverse('invoicing:edit_invoice', kwargs={'invoice_id':invoice_id}))

@login_required
def preview_invoice(request, invoice_id, template="invoicing/preview_invoice.html", context=None):

    invoice = models.Invoice.objects.filter_by_logged_in_user(request.user).get(pk=invoice_id)
    bp = _get_best_bp(request, invoice)

    # Hack
    # if not bp.has_view_invoices:
    #     raise PermissionDenied

    context = context or {}
    context['invoice'] = invoice
    context['local_company_details'] = settings.INVOICE_DETAILS
    return render(request, template, context)

@login_required
def generate_invoice(request, invoice_id, context=None):

    invoice = models.Invoice.objects.filter_by_logged_in_user(request.user).get(pk=invoice_id)
    bp = _get_best_bp(request, invoice)

    # Hack
    # if not bp.has_view_invoices:
    #     raise PermissionDenied

    url = request.build_absolute_uri(reverse('invoicing:print_invoice_from_phantomjs',
                                             kwargs={'invoice_id':invoice.id,
                                                     'username':request.user.username,
                                                     'token':request.user.profile.authenticate_token}))
    filename = "%s_%s_invoice%s.pdf" % (invoice.client.filename_prefix,
                                        settings.INVOICE_DETAILS['name'].lower().replace(" ",""),
                                        invoice.invoice_number)
    response = render_url_to_pdf(url, request, basename=filename)

    f = ContentFile(response.content)
    if invoice.project:
        document = timepiece.BusinessDocument.objects.create(business=invoice.project.business,
                                                             project=invoice.project,
                                                             filename=filename,
                                                             doc_type='invoice',
                                                             mime_type='application/pdf',
                                                             comments='auto created\n%s'%url.replace("token","xx"),
                                                             original_content=' ',
                                                             created_by_id=request.user.id,
                                                             modified_by_id=request.user.id)
        document.doc.save(filename, f)

    return response

def _override_login(request, user):
    if not hasattr(user, 'backend'):
        for backend in settings.AUTHENTICATION_BACKENDS:
            if user == load_backend(backend).get_user(user.pk):
                user.backend = backend
                break
    if hasattr(user, 'backend'):
        return django_login(request, user)



def print_invoice_from_phantomjs(request, invoice_id, username, token, template="invoicing/print_invoice.html", context=None):
    context = context or {}

    user = timepiece.UserProfile.objects.get(authenticate_token=token, user__username=username).user
    _override_login(request, user)

    invoice = models.Invoice.objects.filter_by_logged_in_user(request.user).get(pk=invoice_id)
    bp = _get_best_bp(request, invoice)

    # hack
    # if not bp.has_view_invoices:
    #    raise PermissionDenied

    context['invoice'] = invoice
    context['local_company_details'] = settings.INVOICE_DETAILS

    return render(request, template, context)

def _get_best_bp(request, invoice=None):
    if invoice is None or invoice.project is None:
        return timepiece.BusinessPermissions.for_user(request.user)
    else:
        return timepiece.BusinessPermissions.for_user(request.user, invoice.project.business)

def clone_invoice(request, invoice_id, template="invoicing/edit_invoice.html", context=None):
    context = context or {}
    invoice = models.Invoice.objects.filter_by_logged_in_user(request.user).get(pk=invoice_id)
    items = invoice.items.all().order_by("pk")

    invoice.invoice_number = models.Invoice.next_invoice_number()
    invoice.pk = models.Invoice.objects.all().filter_by_logged_in_user(request.user).aggregate(Max('id'))['id__max']+1
    invoice.save()

    for item in items:
        item.id = models.InvoiceItem.objects.all().aggregate(Max('id'))['id__max']+1
        item.invoice_id = invoice.id
        item.save()

    messages.info(request, "Invoice cloned")
    return HttpResponseRedirect(reverse('invoicing:edit_invoice', kwargs={'invoice_id':invoice.id}))

@login_required
def quotes(request, template="invoicing/quotes.html", context=None):
    context = context or {}

    bp = _get_best_bp(request)
    if not bp.has_view_quotes:
        raise PermissionDenied

    quotes = models.Quote.objects.all().order_by("-created")
    filter_form = QuoteFilterForm(request.GET or None)
    if filter_form.is_valid():
        quotes = filter_form.filter(quotes)

    context['quotes'] = quotes
    context['totals'] = quotes
    context['filter_form'] = filter_form
    context['bp'] = bp
    return render(request, template, context)

@login_required
def new_quote(request, template="invoicing/new_quote.html", context=None):
    context = context or {}

    bp = _get_best_bp(request)
    if not bp.has_edit_quotes:
        raise PermissionDenied
    request.POST = request.GET
    form = QuoteForm(request.POST or None, initial=request.GET.dict())
    if form.is_valid():
        quote = form.save()

        if form.cleaned_data['update_sprint_budget'] and quote.project:
            project = quote.project
            project.budget = quote.amount
            project.save()
        messages.info(request, "Quote created")
        return HttpResponseRedirect(reverse('invoicing:edit_quote', kwargs={'quote_id':quote.id}))
    else:
        messages.info(request, "Quote create failed: %s" % form._errors)

    context['form'] = form
    return render(request, template, context)

@login_required
def edit_quote(request, quote_id, template="invoicing/edit_quote.html", context=None):
    context = context or {}
    quote = models.Quote.objects.get(pk=quote_id)

    bp = _get_best_bp(request, quote)
    if not bp.has_edit_quotes:
        raise PermissionDenied

    form = QuoteForm(request.POST or None, instance=quote)

    if form.is_valid():
        quote = form.save()
        messages.info(request, "Quote updated")
        return HttpResponseRedirect(reverse('invoicing:edit_quote', kwargs={'quote_id':quote.id}))

    context['form'] = form
    context['quote'] = quote
    return render(request, template, context)


@login_required
def statements(request, template="invoicing/statements.html", context=None):
    context = context or {}
    filter_form = StatementFilterForm(request.GET or None)
    bp = _get_best_bp(request, invoice=None)
    if not bp.has_view_invoices:
        raise PermissionDenied
    context['filter_form'] = filter_form
    return render(request, template, context)


@login_required
def statement(request,
              format,
              template="invoicing/preview_statement.html",
              context=None):

    context = context or {}
    filter_form = StatementFilterForm(request.GET or None)

    if not filter_form.is_valid():
        raise Exception("Couldn't generate statement: %s" % filter_form.errors)
    invoices = models.Invoice.objects.all().filter_by_logged_in_user(request.user).order_by("invoice_number")
    invoices = filter_form.filter(invoices)
    if invoices.count() > 0:
        bp = _get_best_bp(request, invoice=invoices[0])
        if not bp.has_view_invoices:
            raise PermissionDenied

    context['invoices'] = invoices
    context['filter'] = filter_form.cleaned_data
    context['generated_on'] = datetime.today()
    context['filter_form'] = filter_form

    if format == "pdf":
        data = copy.copy(request.GET)
        data['username'] = request.user.username
        data['token'] = request.user.profile.authenticate_token
        url = request.build_absolute_uri(
            reverse('invoicing:print_statement_from_phantomjs'))

        url = create_url_from_query_dict(url, data)

        filename = "%s_statement_from_%s_to_%s.pdf" % (
            filter_form.cleaned_data['client'].name.lower().replace(" ", ""),
            filter_form.cleaned_data['issued_from'].strftime("%d%b%Y"),
            filter_form.cleaned_data['issued_to'].strftime("%d%b%Y"))

        response = render_url_to_pdf(url, request, basename=filename)
        return response
    else:
        return render(request, template, context)


def print_statement_from_phantomjs(request,
                                   template="invoicing/print_statement.html",
                                   context=None):

    context = context or {}

    username = request.GET['username']
    token = request.GET['token']
    user = timepiece.UserProfile.objects.get(authenticate_token=token,
                                             user__username=username).user
    _override_login(request, user)

    filter_form = StatementFilterForm(request.GET or None)
    if not filter_form.is_valid():
        raise Exception("Couldn't generate statement: %s" % filter_form.errors)
    invoices = models.Invoice.objects.all().filter_by_logged_in_user(request.user).order_by("invoice_number")
    invoices = filter_form.filter(invoices)
    if invoices.count() > 0:
        bp = _get_best_bp(request, invoice=invoices[0])
        if not bp.has_view_invoices:
            raise PermissionDenied

    context['invoices'] = invoices
    context['filter'] = filter_form.cleaned_data
    context['generated_on'] = datetime.today()

    return render(request, template, context)
