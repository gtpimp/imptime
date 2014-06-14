try:
    from django.conf.urls import patterns, include, url
except ImportError:
    from django.conf.urls.defaults import patterns, include, url

import views

urlpatterns = patterns('',
                       url(r'^$', views.clients, name='clients'),
                       url(r'^$', views.invoices, name='invoices'),
)
