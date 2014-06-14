from invoicing import models
from django.shortcuts import render_to_response, get_object_or_404, redirect, render
from django.template import RequestContext

def clients(request, template="invoicing/clients.html", context=None):
    context = context or {}
    return render_to_response(template, context, context_instance=RequestContext(request))

def invoices(request, template="invoicing/invoices.html", context=None):
    context = context or {}
    return render_to_response(template, context, context_instance=RequestContext(request))

