from invoicing import models
from django.db.models import Sum, Count, Q, F, Max, Min
from timepiece import models as timepiece
from django.core.files.base import ContentFile
from django.contrib.auth import login as django_login, load_backend
from django.shortcuts import render_to_response, get_object_or_404, redirect, render
from django.contrib.auth.decorators import login_required, permission_required
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse, resolve
from django.template import RequestContext
from django.contrib import messages
from forms import *

@login_required
def clients(request, template="invoicing/clients.html", context=None):
    context = context or {}
    context['clients'] = models.ClientInvoiceDetails.objects.all().order_by("name")
    return render_to_response(template, context, context_instance=RequestContext(request))

@login_required
def invoices(request, template="invoicing/invoices.html", context=None):
    context = context or {}
    
    bp = _get_best_bp(request)
    if not bp.has_view_invoices:
        raise PermissionDenied

    invoices = models.Invoice.objects.all().order_by("-created")
    filter_form = InvoiceFilterForm(request.GET or None)
    if filter_form.is_valid():
        invoices = filter_form.filter(invoices)

    context['invoices'] = invoices
    context['totals'] = context['invoices']
    context['filter_form'] = filter_form
    context['bp'] = bp
    return render_to_response(template, context, context_instance=RequestContext(request))

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
    return render_to_response(template, context, context_instance=RequestContext(request))

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
    return render_to_response(template, context, context_instance=RequestContext(request))

@login_required
def new_invoice(request, template="invoicing/new_invoice.html", context=None):
    context = context or {}

    bp = _get_best_bp(request)
    if not bp.has_edit_invoices:
        raise PermissionDenied

    form = InvoiceForm(request.POST or None)
    items_formset = invoice_item_formset(request.POST or None, prefix='items', queryset=models.InvoiceItem.objects.none())
    if form.is_valid() and items_formset.is_valid():
        invoice = form.save()
        items = items_formset.save(commit=False)
        for item in items:
            item.invoice = invoice
            item.save()
        items_formset.save_m2m()
        messages.info(request, "Invoice created")
        return HttpResponseRedirect(reverse('invoicing:edit_invoice', kwargs={'invoice_id':invoice.id}))

    context['form'] = form
    context['items_formset'] = items_formset
    return render_to_response(template, context, context_instance=RequestContext(request))

@login_required
def edit_invoice(request, invoice_id, template="invoicing/edit_invoice.html", context=None):
    context = context or {}
    invoice = models.Invoice.objects.get(pk=invoice_id)

    bp = _get_best_bp(request, invoice)
    if not bp.has_edit_invoices:
        raise PermissionDenied

    form = InvoiceForm(request.POST or None, instance=invoice)
    items_formset = invoice_item_formset(request.POST or None, queryset = invoice.items.all().order_by("pk"), prefix='items')
    payments_formset = invoice_payment_formset(request.POST or None, queryset = invoice.payments.all().order_by("paid_at"), prefix='payments')
    if form.is_valid() and items_formset.is_valid() and payments_formset.is_valid():
        invoice = form.save()
        items = items_formset.save(commit=False)
        for item in items:
            item.invoice = invoice
            item.save()
        payments = payments_formset.save(commit=False)
        items_formset.save_m2m()
        for payment in payments:
            payment.invoice = invoice
            
            fail_count = 0
            while True:
                try:
                    payment.save()
                    break
                except Exception, ex:
                    logger.warning("Getting integrity error during save, most likely a problem with sequences: %s" % ex)
                    fail_count += 1
                    if fail_count>200:
                        raise
                
        payments_formset.save_m2m()
        messages.info(request, "Invoice updated")
        return HttpResponseRedirect(reverse('invoicing:edit_invoice', kwargs={'invoice_id':invoice.id}))

    context['form'] = form
    context['items_formset'] = items_formset
    context['payments_formset'] = payments_formset
    context['invoice'] = invoice
    return render_to_response(template, context, context_instance=RequestContext(request))

@login_required
def preview_invoice(request, invoice_id, template="invoicing/preview_invoice.html", context=None):

    invoice = models.Invoice.objects.get(pk=invoice_id)
    bp = _get_best_bp(request, invoice)
    if not bp.has_view_invoices:
        raise PermissionDenied

    context = context or {}
    context['invoice'] = invoice
    context['local_company_details'] = settings.INVOICE_DETAILS
    return render_to_response(template, context, context_instance=RequestContext(request))

@login_required
def generate_invoice(request, invoice_id, context=None):

    invoice = models.Invoice.objects.get(pk=invoice_id)
    bp = _get_best_bp(request, invoice)
    if not bp.has_view_invoices:
        raise PermissionDenied

    url = request.build_absolute_uri(reverse('invoicing:print_invoice_from_phantomjs',
                                             kwargs={'invoice_id':invoice.id,
                                                     'username':request.user.username,
                                                     'token':request.user.profile.authenticate_token}))
    from phantompdf.create_pdf import create_pdf
    as_pdf = create_pdf(url)
    rendered = HttpResponse(as_pdf, mimetype='application/pdf')
    filename = "%s_%s_invoice%s.pdf" % (invoice.client.filename_prefix,
                                        settings.INVOICE_DETAILS['name'].lower().replace(" ",""), 
                                        invoice.invoice_number)
    rendered = HttpResponse(as_pdf, mimetype='application/pdf')
    rendered['Content-Disposition'] = 'attachment; filename="%s"' % filename

    f = ContentFile(as_pdf)
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

    return rendered

def print_invoice_from_phantomjs(request, invoice_id, username, token, template="invoicing/print_invoice.html", context=None):
    context = context or {}

    def override_login(request, user):
        if not hasattr(user, 'backend'):
            for backend in settings.AUTHENTICATION_BACKENDS:
                if user == load_backend(backend).get_user(user.pk):
                    user.backend = backend
                    break
        if hasattr(user, 'backend'):
            return django_login(request, user)
        
    user = timepiece.UserProfile.objects.get(authenticate_token=token, user__username=username).user
    override_login(request, user)

    invoice = models.Invoice.objects.get(pk=invoice_id)
    bp = _get_best_bp(request, invoice)
    if not bp.has_view_invoices:
        raise PermissionDenied

    context['invoice'] = invoice
    context['local_company_details'] = settings.INVOICE_DETAILS

    return render_to_response(template, context, context_instance=RequestContext(request))

def _get_best_bp(request, invoice=None):
    if invoice is None or invoice.project is None:
        return timepiece.BusinessPermissions.for_user(request.user, timepiece.Business.objects.all()[0])
    else:
        return timepiece.BusinessPermissions.for_user(request.user, invoice.project.business)

def clone_invoice(request, invoice_id, template="invoicing/edit_invoice.html", context=None):
    context = context or {}
    invoice = models.Invoice.objects.get(pk=invoice_id)
    items = invoice.items.all().order_by("pk")

    invoice.invoice_number = models.Invoice.next_invoice_number()
    invoice.pk = models.Invoice.objects.all().aggregate(Max('id'))['id__max']+1
    invoice.save()

    for item in items:
        item.id = models.InvoiceItem.objects.all().aggregate(Max('id'))['id__max']+1
        item.invoice_id = invoice.id
        item.save()
        
    messages.info(request, "Invoice cloned")
    return HttpResponseRedirect(reverse('invoicing:edit_invoice', kwargs={'invoice_id':invoice.id}))

    