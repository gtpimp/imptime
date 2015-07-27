# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'MailerMessage'
        db.create_table(u'mailqueue_mailermessage', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('subject', self.gf('django.db.models.fields.CharField')(max_length=250, blank=True)),
            ('to_address', self.gf('django.db.models.fields.TextField')()),
            ('bcc_address', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('from_address', self.gf('django.db.models.fields.EmailField')(max_length=250)),
            ('content', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('html_content', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('app', self.gf('django.db.models.fields.CharField')(max_length=250, blank=True)),
            ('sent', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('last_attempt', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal(u'mailqueue', ['MailerMessage'])

        # Adding model 'Attachment'
        db.create_table(u'mailqueue_attachment', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('file_attachment', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
            ('email', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['mailqueue.MailerMessage'], null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
        ))
        db.send_create_signal(u'mailqueue', ['Attachment'])


    def backwards(self, orm):
        # Deleting model 'MailerMessage'
        db.delete_table(u'mailqueue_mailermessage')

        # Deleting model 'Attachment'
        db.delete_table(u'mailqueue_attachment')


    models = {
        u'mailqueue.attachment': {
            'Meta': {'object_name': 'Attachment'},
            'email': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mailqueue.MailerMessage']", 'null': 'True', 'blank': 'True'}),
            'file_attachment': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        u'mailqueue.mailermessage': {
            'Meta': {'object_name': 'MailerMessage'},
            'app': ('django.db.models.fields.CharField', [], {'max_length': '250', 'blank': 'True'}),
            'bcc_address': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'content': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {}),
            'from_address': ('django.db.models.fields.EmailField', [], {'max_length': '250'}),
            'html_content': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_attempt': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'sent': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'subject': ('django.db.models.fields.CharField', [], {'max_length': '250', 'blank': 'True'}),
            'to_address': ('django.db.models.fields.TextField', [], {})
        }
    }

    complete_apps = ['mailqueue']