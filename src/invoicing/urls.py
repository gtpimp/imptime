try:
    from django.conf.urls import patterns, include, url
except ImportError:
    from django.conf.urls.defaults import patterns, include, url

import views

urlpatterns = patterns('',
                       url(r'^clients$', views.clients, name='clients'),
                       url(r'^invoices$', views.invoices, name='invoices'),
                       url(r'^new_client$', views.new_client, name='new_client'),
                       url(r'^edit_client/(?P<client_id>.*)$', views.edit_client, name='edit_client'),
)
