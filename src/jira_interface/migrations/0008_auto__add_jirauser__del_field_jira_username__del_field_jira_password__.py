# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'JiraUser'
        db.create_table('jira_interface_jirauser', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('jira', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['jira_interface.Jira'])),
            ('timepiece_user', self.gf('django.db.models.fields.related.ForeignKey')(related_name='jira_user', to=orm['auth.User'])),
            ('jira_username', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('jira_password', self.gf('django.db.models.fields.CharField')(max_length=255)),
        ))
        db.send_create_signal('jira_interface', ['JiraUser'])

        # Deleting field 'Jira.username'
        db.delete_column('jira_interface_jira', 'username')

        # Deleting field 'Jira.password'
        db.delete_column('jira_interface_jira', 'password')

        # Deleting field 'Jira.primary_user'
        db.delete_column('jira_interface_jira', 'primary_user_id')


    def backwards(self, orm):
        # Deleting model 'JiraUser'
        db.delete_table('jira_interface_jirauser')

        # Adding field 'Jira.username'
        db.add_column('jira_interface_jira', 'username',
                      self.gf('django.db.models.fields.CharField')(default=None, max_length=255),
                      keep_default=False)

        # Adding field 'Jira.password'
        db.add_column('jira_interface_jira', 'password',
                      self.gf('django.db.models.fields.CharField')(default=None, max_length=255),
                      keep_default=False)

        # Adding field 'Jira.primary_user'
        db.add_column('jira_interface_jira', 'primary_user',
                      self.gf('django.db.models.fields.related.ForeignKey')(related_name='primary_user', null=True, to=orm['auth.User'], blank=True),
                      keep_default=False)


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'jira_interface.jira': {
            'Meta': {'object_name': 'Jira'},
            'board_id': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'business': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'jira'", 'to': "orm['timepiece.Business']"}),
            'custom_field_name_for_issue_order': ('django.db.models.fields.CharField', [], {'default': "'customfield_10006'", 'max_length': '20'}),
            'host': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'sync_actual_times': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'sync_issue_ordering_from_jira': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'sync_issue_ordering_to_jira': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        'jira_interface.jirasyncstatus': {
            'Meta': {'object_name': 'JiraSyncStatus'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'jira': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['jira_interface.Jira']"}),
            'updated_at': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'})
        },
        'jira_interface.jirauser': {
            'Meta': {'object_name': 'JiraUser'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'jira': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['jira_interface.Jira']"}),
            'jira_password': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'jira_username': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'timepiece_user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'jira_user'", 'to': "orm['auth.User']"})
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