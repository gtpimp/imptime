# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClientInvoiceDetails',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('address1', models.CharField(max_length=255, null=True, blank=True)),
                ('address2', models.CharField(max_length=255, null=True, blank=True)),
                ('city', models.CharField(max_length=255, null=True, blank=True)),
                ('country', models.CharField(max_length=255, null=True, blank=True)),
                ('postal_code', models.CharField(max_length=255, null=True, blank=True)),
                ('vat_number', models.CharField(max_length=30, null=True, blank=True)),
                ('taxable', models.BooleanField(default=True)),
                ('filename_prefix', models.CharField(max_length=30)),
                ('contact_first_name', models.CharField(max_length=255, null=True, blank=True)),
                ('contact_last_name', models.CharField(max_length=255, null=True, blank=True)),
                ('contact_email', models.CharField(max_length=255, null=True, blank=True)),
                ('contact_phone', models.CharField(max_length=255, null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('internal_comment', models.TextField(null=True, verbose_name=b"Comment (doesn't appear on the invoice", blank=True)),
                ('invoice_number', models.IntegerField(default=0)),
                ('client_order_name', models.CharField(max_length=50, null=True, verbose_name=b'Optional client order name', blank=True)),
                ('client_order_number', models.CharField(max_length=50, null=True, verbose_name=b'Optional client order number', blank=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('invoice_note', models.CharField(max_length=255, null=True, blank=True)),
                ('issued_at', models.DateField()),
                ('payment_due', models.DateField()),
                ('currency_symbol', models.CharField(default=b'R', max_length=3, choices=[(b'R', b'R'), (b'\xc2\xa3', b'\xc2\xa3'), (b'\xe2\x82\xac', b'\xe2\x82\xac'), (b'bitcoin', b'B')])),
                ('footer_terms', models.TextField(null=True, blank=True)),
                ('status', models.CharField(default=b'open', max_length=20, choices=[(b'open', b'Open'), (b'paid', b'Paid'), (b'writtenoff', b'Written Off')])),
                ('business', models.ForeignKey(related_name='invoices', blank=True, to='timepiece.Business', null=True)),
                ('client', models.ForeignKey(related_name='invoices', to='invoicing.ClientInvoiceDetails')),
                ('project', models.ForeignKey(related_name='invoices', blank=True, to='timepiece.Project', null=True)),
            ],
        ),
        migrations.CreateModel(
            name='InvoiceItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('num_units', models.FloatField()),
                ('unit_cost', models.FloatField()),
                ('total_cost', models.FloatField()),
                ('description', models.CharField(max_length=255)),
                ('order', models.IntegerField(default=0, null=True, blank=True)),
                ('invoice', models.ForeignKey(related_name='items', to='invoicing.Invoice')),
            ],
        ),
        migrations.CreateModel(
            name='InvoicePayment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('amount', models.FloatField()),
                ('paid_at', models.DateField()),
                ('description', models.CharField(max_length=255, null=True, blank=True)),
                ('invoice', models.ForeignKey(related_name='payments', to='invoicing.Invoice')),
            ],
        ),
        migrations.CreateModel(
            name='Quote',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('internal_comment', models.TextField(null=True, verbose_name=b'Comment (not sent to the client)', blank=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('sent_to_client_at', models.DateField(null=True, blank=True)),
                ('accepted_at', models.DateField(null=True, blank=True)),
                ('status', models.CharField(default=b'open', max_length=20, choices=[(b'creating', b'Creating'), (b'sent to client', b'Sent to client'), (b'accepted', b'Accepted by client'), (b'rejected', b'Rejected by client'), (b'work done', b'Work done')])),
                ('amount', models.IntegerField(null=True, blank=True)),
                ('currency_symbol', models.CharField(default=b'R', max_length=3, choices=[(b'R', b'R'), (b'\xc2\xa3', b'\xc2\xa3'), (b'\xe2\x82\xac', b'\xe2\x82\xac'), (b'bitcoin', b'B')])),
                ('additional_document', models.FileField(null=True, upload_to=b'quotes_additional_documents', blank=True)),
                ('project', models.ForeignKey(related_name='quotes', blank=True, to='timepiece.Project', null=True)),
                ('quote_document', models.ForeignKey(blank=True, to='timepiece.BusinessDocument', null=True)),
            ],
        ),
    ]
