# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Jira.custom_field_name_for_issue_order'
        db.add_column('jira_interface_jira', 'custom_field_name_for_issue_order',
                      self.gf('django.db.models.fields.CharField')(default='customfield_10006', max_length=20),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Jira.custom_field_name_for_issue_order'
        db.delete_column('jira_interface_jira', 'custom_field_name_for_issue_order')


    models = {
        'jira_interface.jira': {
            'Meta': {'object_name': 'Jira'},
            'board_id': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'business': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'jira'", 'to': "orm['timepiece.Business']"}),
            'custom_field_name_for_issue_order': ('django.db.models.fields.CharField', [], {'default': "'customfield_10006'", 'max_length': '20'}),
            'host': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'username': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'timepiece.business': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Business'},
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'external_id': ('django.db.models.fields.CharField', [], {'max_length': '32', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'notes': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '255', 'blank': 'True'}),
            'sync_with': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['jira_interface']