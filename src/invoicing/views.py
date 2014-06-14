from invoicing import models
from django.shortcuts import render_to_response, get_object_or_404, redirect, render
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse, resolve
from django.template import RequestContext
from django.contrib import messages
from forms import *

def clients(request, template="invoicing/clients.html", context=None):
    context = context or {}
    context['clients'] = models.ClientInvoiceDetails.objects.all().order_by("name")
    return render_to_response(template, context, context_instance=RequestContext(request))

def invoices(request, template="invoicing/invoices.html", context=None):
    context = context or {}
    context['invoices'] = models.Invoice.objects.all().order_by("-created")
    return render_to_response(template, context, context_instance=RequestContext(request))

def new_client(request, template="invoicing/new_client.html", context=None):
    context = context or {}
    form = ClientInvoiceDetailsForm(request.POST or None)
    if form.is_valid():
        client = form.save()
        messages.info(request, "Client created")
        return HttpResponseRedirect(reverse('invoicing:edit_client', kwargs={'client_id':client.id}))

    context['form'] = form
    return render_to_response(template, context, context_instance=RequestContext(request))

def edit_client(request, client_id, template="invoicing/edit_client.html", context=None):
    context = context or {}
    client = models.ClientInvoiceDetails.objects.get(pk=client_id)
    form = ClientInvoiceDetailsForm(request.POST or None, instance=client)
    if form.is_valid():
        client = form.save()
        messages.info(request, "Client saved")
        return HttpResponseRedirect(reverse('invoicing:edit_client', kwargs={'client_id':client.id}))

    context['form'] = form
    context['client'] = client
    return render_to_response(template, context, context_instance=RequestContext(request))

def new_invoice(request, template="invoicing/new_invoice.html", context=None):
    context = context or {}
    form = InvoiceForm(request.POST or None)
    items_formset = invoice_item_formset(request.POST or None)
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
    return render_to_response(template, context, context_instance=RequestContext(request))

def edit_invoice(request, invoice_id, template="invoicing/edit_invoice.html", context=None):
    context = context or {}
    invoice = models.Invoice.objects.get(pk=invoice_id)
    form = InvoiceForm(request.POST or None, instance=invoice)
    items_formset = invoice_item_formset(request.POST or None, queryset = invoice.items.all().order_by("pk"))
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
    context['invoice'] = invoice
    return render_to_response(template, context, context_instance=RequestContext(request))