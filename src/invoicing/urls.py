try:
    from django.conf.urls import patterns, include, url
except ImportError:
    from django.conf.urls.defaults import patterns, include, url

import views

urlpatterns = patterns(
    '',
    url(r'^clients$', views.clients, name='clients'),
    url(r'^new_client$', views.new_client, name='new_client'),
    url(r'^edit_client/(?P<client_id>.*)$', views.edit_client,
        name='edit_client'),

    url(r'^invoices$', views.invoices, name='invoices'),
    url(r'^new_invoice$', views.new_invoice, name='new_invoice'),
    url(r'^edit_invoice/(?P<invoice_id>.*)$', views.edit_invoice,
        name='edit_invoice'),
    url(r'^clone_invoice/(?P<invoice_id>.*)$', views.clone_invoice,
        name='clone_invoice'),

    url(r'^preview_invoice/(?P<invoice_id>.*)$', views.preview_invoice,
        name='preview_invoice'),
    url(r'^generate_invoice/(?P<invoice_id>.*)$', views.generate_invoice,
        name='generate_invoice'),
    url(r'^print_invoice_from_phantomjs/(?P<invoice_id>.*)/(?P<username>.*)/(?P<token>.*)$',
        views.print_invoice_from_phantomjs, name='print_invoice_from_phantomjs'),

    url(r'^quotes$', views.quotes, name='quotes'),
    url(r'^new_quote$', views.new_quote, name='new_quote'),
    url(r'^edit_quote/(?P<quote_id>.*)$', views.edit_quote, name='edit_quote'),

    url(r'^statements$', views.statements, name='statements'),
    url(r'^statement$', views.statement, {'format': 'html'},
        name='statement'),
    url(r'^statement/download$', views.statement, {'format': 'pdf'},
        name='download_statement'),
    url(r'^print_statement_from_phantomjs/$',
        views.print_statement_from_phantomjs,
        name='print_statement_from_phantomjs'),
)
