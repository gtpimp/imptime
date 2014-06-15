# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'ClientInvoiceDetails.province'
        db.delete_column(u'invoicing_clientinvoicedetails', 'province')

        # Deleting field 'ClientInvoiceDetails.contact_title'
        db.delete_column(u'invoicing_clientinvoicedetails', 'contact_title')

        # Adding field 'ClientInvoiceDetails.vat_number'
        db.add_column(u'invoicing_clientinvoicedetails', 'vat_number',
                      self.gf('django.db.models.fields.BooleanField')(default=True),
                      keep_default=False)

        # Adding field 'Invoice.client_order_name'
        db.add_column(u'invoicing_invoice', 'client_order_name',
                      self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Invoice.client_order_number'
        db.add_column(u'invoicing_invoice', 'client_order_number',
                      self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Invoice.currency_symbol'
        db.add_column(u'invoicing_invoice', 'currency_symbol',
                      self.gf('django.db.models.fields.CharField')(default='R', max_length=3),
                      keep_default=False)


        # Changing field 'Invoice.payment_due'
        db.alter_column(u'invoicing_invoice', 'payment_due', self.gf('django.db.models.fields.DateField')())

    def backwards(self, orm):
        # Adding field 'ClientInvoiceDetails.province'
        db.add_column(u'invoicing_clientinvoicedetails', 'province',
                      self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True),
                      keep_default=False)

        # Adding field 'ClientInvoiceDetails.contact_title'
        db.add_column(u'invoicing_clientinvoicedetails', 'contact_title',
                      self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True),
                      keep_default=False)

        # Deleting field 'ClientInvoiceDetails.vat_number'
        db.delete_column(u'invoicing_clientinvoicedetails', 'vat_number')

        # Deleting field 'Invoice.client_order_name'
        db.delete_column(u'invoicing_invoice', 'client_order_name')

        # Deleting field 'Invoice.client_order_number'
        db.delete_column(u'invoicing_invoice', 'client_order_number')

        # Deleting field 'Invoice.currency_symbol'
        db.delete_column(u'invoicing_invoice', 'currency_symbol')


        # Changing field 'Invoice.payment_due'
        db.alter_column(u'invoicing_invoice', 'payment_due', self.gf('django.db.models.fields.DateTimeField')())

    models = {
        u'invoicing.clientinvoicedetails': {
            'Meta': {'object_name': 'ClientInvoiceDetails'},
            'address1': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'address2': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'contact_email': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'contact_first_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'contact_last_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'contact_phone': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'postal_code': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'taxable': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'vat_number': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        },
        u'invoicing.invoice': {
            'Meta': {'object_name': 'Invoice'},
            'client': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['invoicing.ClientInvoiceDetails']"}),
            'client_order_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'client_order_number': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'currency_symbol': ('django.db.models.fields.CharField', [], {'default': "'R'", 'max_length': '3'}),
            'footer_terms': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'invoice_note': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'invoice_number': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'payment_due': ('django.db.models.fields.DateField', [], {}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'open'", 'max_length': '20'})
        },
        u'invoicing.invoiceitem': {
            'Meta': {'object_name': 'InvoiceItem'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'invoice': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'items'", 'to': u"orm['invoicing.Invoice']"}),
            'num_units': ('django.db.models.fields.FloatField', [], {}),
            'unit_cost': ('django.db.models.fields.FloatField', [], {})
        },
        u'invoicing.invoicepayment': {
            'Meta': {'object_name': 'InvoicePayment'},
            'amount': ('django.db.models.fields.FloatField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'invoice': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['invoicing.Invoice']"}),
            'paid_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['invoicing']