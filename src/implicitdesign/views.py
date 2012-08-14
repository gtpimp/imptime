from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext

def home(request, template="home.html", context=None):
    context = context or {}
    return render_to_response(template, context, context_instance=RequestContext(request))
