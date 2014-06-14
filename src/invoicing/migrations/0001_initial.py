# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'ClientInvoiceDetails'
        db.create_table(u'invoicing_clientinvoicedetails', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('address1', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('address2', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('city', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('province', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('country', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('postal_code', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('taxable', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('contact_title', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('contact_first_name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('contact_last_name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('contact_email', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('contact_phone', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
        ))
        db.send_create_signal(u'invoicing', ['ClientInvoiceDetails'])

        # Adding model 'Invoice'
        db.create_table(u'invoicing_invoice', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('client', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['invoicing.ClientInvoiceDetails'])),
            ('invoice_number', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('modified', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('invoice_note', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('payment_due', self.gf('django.db.models.fields.DateTimeField')()),
            ('footer_terms', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('status', self.gf('django.db.models.fields.CharField')(default='open', max_length=20)),
        ))
        db.send_create_signal(u'invoicing', ['Invoice'])

        # Adding model 'InvoiceItem'
        db.create_table(u'invoicing_invoiceitem', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('invoice', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['invoicing.Invoice'])),
            ('num_units', self.gf('django.db.models.fields.FloatField')()),
            ('unit_cost', self.gf('django.db.models.fields.FloatField')()),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=255)),
        ))
        db.send_create_signal(u'invoicing', ['InvoiceItem'])

        # Adding model 'InvoicePayment'
        db.create_table(u'invoicing_invoicepayment', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('invoice', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['invoicing.Invoice'])),
            ('amount', self.gf('django.db.models.fields.FloatField')()),
            ('paid_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'invoicing', ['InvoicePayment'])


    def backwards(self, orm):
        # Deleting model 'ClientInvoiceDetails'
        db.delete_table(u'invoicing_clientinvoicedetails')

        # Deleting model 'Invoice'
        db.delete_table(u'invoicing_invoice')

        # Deleting model 'InvoiceItem'
        db.delete_table(u'invoicing_invoiceitem')

        # Deleting model 'InvoicePayment'
        db.delete_table(u'invoicing_invoicepayment')


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
            'contact_title': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'postal_code': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'province': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'taxable': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        },
        u'invoicing.invoice': {
            'Meta': {'object_name': 'Invoice'},
            'client': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['invoicing.ClientInvoiceDetails']"}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'footer_terms': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'invoice_note': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'invoice_number': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'payment_due': ('django.db.models.fields.DateTimeField', [], {}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'open'", 'max_length': '20'})
        },
        u'invoicing.invoiceitem': {
            'Meta': {'object_name': 'InvoiceItem'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'invoice': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['invoicing.Invoice']"}),
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