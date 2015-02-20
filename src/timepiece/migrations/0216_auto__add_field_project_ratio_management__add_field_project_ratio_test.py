# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Project.ratio_management'
        db.add_column(u'timepiece_project', 'ratio_management',
                      self.gf('django.db.models.fields.FloatField')(default=0.2),
                      keep_default=False)

        # Adding field 'Project.ratio_testing'
        db.add_column(u'timepiece_project', 'ratio_testing',
                      self.gf('django.db.models.fields.FloatField')(default=0.2),
                      keep_default=False)

        # Adding field 'Project.ratio_scope_creep'
        db.add_column(u'timepiece_project', 'ratio_scope_creep',
                      self.gf('django.db.models.fields.FloatField')(default=0.25),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Project.ratio_management'
        db.delete_column(u'timepiece_project', 'ratio_management')

        # Deleting field 'Project.ratio_testing'
        db.delete_column(u'timepiece_project', 'ratio_testing')

        # Deleting field 'Project.ratio_scope_creep'
        db.delete_column(u'timepiece_project', 'ratio_scope_creep')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Group']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Permission']"}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'timepiece.activity': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Activity'},
            'billable': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'code': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '5'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'timepiece.activitygroup': {
            'Meta': {'object_name': 'ActivityGroup'},
            'activities': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'activity_group'", 'symmetrical': 'False', 'to': u"orm['timepiece.Activity']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'})
        },
        u'timepiece.assignmentallocation': {
            'Meta': {'object_name': 'AssignmentAllocation'},
            'assignment': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'blocks'", 'to': u"orm['timepiece.ContractAssignment']"}),
            'date': ('django.db.models.fields.DateField', [], {}),
            'hours': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'timepiece.attribute': {
            'Meta': {'ordering': "('sort_order',)", 'unique_together': "(('type', 'label'),)", 'object_name': 'Attribute'},
            'billable': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'enable_timetracking': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'sort_order': ('django.db.models.fields.SmallIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '32'})
        },
        u'timepiece.business': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Business'},
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'external_id': ('django.db.models.fields.CharField', [], {'max_length': '32', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'invoice_method': ('django.db.models.fields.CharField', [], {'default': "'billable_hours_per_sprint'", 'max_length': '50'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'notes': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '255', 'blank': 'True'}),
            'sync_with': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'})
        },
        u'timepiece.businesscomment': {
            'Meta': {'object_name': 'BusinessComment'},
            'business': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'business_comments'", 'to': u"orm['timepiece.Business']"}),
            'comment': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'modified_by': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'business_comments_modified_by'", 'to': u"orm['auth.User']"})
        },
        u'timepiece.businessdocument': {
            'Meta': {'object_name': 'BusinessDocument'},
            'business': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'documents'", 'to': u"orm['timepiece.Business']"}),
            'comments': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'created_by': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'business_document_created_by'", 'to': u"orm['auth.User']"}),
            'deleted': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'doc': ('django.db.models.fields.files.FileField', [], {'max_length': '100'}),
            'doc_type': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'filename': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mime_type': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'modified_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'modified_by': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'business_document_modified_by'", 'to': u"orm['auth.User']"}),
            'original_content': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'documents'", 'null': 'True', 'to': u"orm['timepiece.Project']"}),
            'token': ('django.db.models.fields.CharField', [], {'max_length': '255', 'db_index': 'True'})
        },
        u'timepiece.businesshistory': {
            'Meta': {'object_name': 'BusinessHistory'},
            'after': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'before': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'business_id': ('django.db.models.fields.IntegerField', [], {'db_index': 'True'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'created_by': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'timepiece.businesspermissions': {
            'Meta': {'unique_together': "(('user', 'business'),)", 'object_name': 'BusinessPermissions'},
            'business': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'business_permissions'", 'to': u"orm['timepiece.Business']"}),
            'can_add_issue': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_add_issue_comment': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_assign_user': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_be_scheduled': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_create_sprint': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_delete_issue': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_do_dev_checklist': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_do_finance_checklist': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_do_traffic_checklist': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_edit_budget': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_edit_business_comments': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_edit_calendar': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_edit_ctc_billable_rates': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_edit_deadlines': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_edit_description': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_edit_feature': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_edit_invoices': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_edit_issue_states': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_edit_issues': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_edit_permissions': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_edit_project_detail': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_edit_project_states': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_edit_subject': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_estimate_own_points': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_import_actual_hours': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_see_other_user_points': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_toggle_graphs': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_view_actual_hours': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_view_budget': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_view_business_comments': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_view_calendar': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_view_ctc_billable_rates': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_view_ctc_rates': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_view_deadlines': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_view_documents': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_view_invoices': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'can_view_issues': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'can_view_project_card': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'business_permissions'", 'to': u"orm['auth.User']"})
        },
        u'timepiece.calendarevent': {
            'Meta': {'object_name': 'CalendarEvent'},
            'business': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'calendar_events'", 'null': 'True', 'to': u"orm['timepiece.Business']"}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'event_type': ('django.db.models.fields.CharField', [], {'default': "'planned'", 'max_length': '50'}),
            'hours': ('django.db.models.fields.DecimalField', [], {'default': '2.0', 'max_digits': '4', 'decimal_places': '2', 'db_index': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'start': ('django.db.models.fields.DateTimeField', [], {'db_index': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'ready'", 'max_length': '50'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        },
        u'timepiece.contractassignment': {
            'Meta': {'unique_together': "(('contract', 'user'),)", 'object_name': 'ContractAssignment'},
            'contract': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'assignments'", 'to': u"orm['timepiece.ProjectContract']"}),
            'end_date': ('django.db.models.fields.DateField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'min_hours_per_week': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'num_hours': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'start_date': ('django.db.models.fields.DateField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'assignments'", 'to': u"orm['auth.User']"})
        },
        u'timepiece.contractmilestone': {
            'Meta': {'ordering': "('end_date',)", 'object_name': 'ContractMilestone'},
            'contract': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'milestones'", 'to': u"orm['timepiece.ProjectContract']"}),
            'end_date': ('django.db.models.fields.DateField', [], {}),
            'hours': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'start_date': ('django.db.models.fields.DateField', [], {})
        },
        u'timepiece.devchecklist': {
            'Meta': {'object_name': 'DevChecklist'},
            'business': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['timepiece.Business']", 'blank': 'True'}),
            'comments': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'created_by': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'dev_checklist_created_by'", 'to': u"orm['auth.User']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'modified_by': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'dev_checklist_modified_by'", 'blank': 'True', 'to': u"orm['auth.User']"}),
            'passed': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'db_index': 'True'})
        },
        u'timepiece.devchecklistitem': {
            'Meta': {'object_name': 'DevChecklistItem'},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dev_checklist': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'items'", 'blank': 'True', 'to': u"orm['timepiece.DevChecklist']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'issue': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['timepiece.Issue']", 'null': 'True', 'blank': 'True'}),
            'msg': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'passed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['timepiece.Project']", 'null': 'True', 'blank': 'True'})
        },
        u'timepiece.entry': {
            'Meta': {'object_name': 'Entry'},
            'activity': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'entries'", 'to': u"orm['timepiece.Activity']"}),
            'comments': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'date_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'end_time': ('django.db.models.fields.DateTimeField', [], {'db_index': 'True', 'null': 'True', 'blank': 'True'}),
            'entry_group': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'entries'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['timepiece.EntryGroup']"}),
            'extended_comments': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'hours': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'issue': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'entries'", 'null': 'True', 'to': u"orm['timepiece.Issue']"}),
            'location': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'entries'", 'to': u"orm['timepiece.Location']"}),
            'pause_time': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'seconds_paused': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            'start_time': ('django.db.models.fields.DateTimeField', [], {}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'unverified'", 'max_length': '24'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'timepiece_entries'", 'to': u"orm['auth.User']"})
        },
        u'timepiece.entrygroup': {
            'Meta': {'object_name': 'EntryGroup'},
            'comments': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'end': ('django.db.models.fields.DateField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'number': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'entry_group'", 'to': u"orm['timepiece.Project']"}),
            'start': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'invoiced'", 'max_length': '24'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'entry_group'", 'to': u"orm['auth.User']"})
        },
        u'timepiece.expense': {
            'Meta': {'object_name': 'Expense'},
            'amount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '0'}),
            'date': ('django.db.models.fields.DateField', [], {}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'paid': ('django.db.models.fields.BooleanField', [], {}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'expense'", 'null': 'True', 'to': u"orm['timepiece.Project']"})
        },
        u'timepiece.feature': {
            'Meta': {'unique_together': "(('name', 'business'),)", 'object_name': 'Feature'},
            'business': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'features'", 'to': u"orm['timepiece.Business']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        u'timepiece.financechecklist': {
            'Meta': {'object_name': 'FinanceChecklist'},
            'business': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['timepiece.Business']", 'blank': 'True'}),
            'comments': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'created_by': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'finance_checklist_created_by'", 'to': u"orm['auth.User']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'modified_by': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'finance_checklist_modified_by'", 'blank': 'True', 'to': u"orm['auth.User']"}),
            'passed': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'db_index': 'True'})
        },
        u'timepiece.financechecklistitem': {
            'Meta': {'object_name': 'FinanceChecklistItem'},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'finance_checklist': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'items'", 'blank': 'True', 'to': u"orm['timepiece.FinanceChecklist']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'issue': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['timepiece.Issue']", 'null': 'True', 'blank': 'True'}),
            'msg': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'passed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['timepiece.Project']", 'null': 'True', 'blank': 'True'})
        },
        u'timepiece.holiday': {
            'Meta': {'object_name': 'Holiday'},
            'applies_on': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'public holiday'", 'max_length': '100', 'blank': 'True'})
        },
        u'timepiece.hourgroup': {
            'Meta': {'object_name': 'HourGroup'},
            'activities': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'activity_bundle'", 'symmetrical': 'False', 'to': u"orm['timepiece.Activity']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'order': ('django.db.models.fields.PositiveIntegerField', [], {'unique': 'True', 'null': 'True', 'blank': 'True'})
        },
        u'timepiece.income': {
            'Meta': {'object_name': 'Income'},
            'amount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '0'}),
            'date': ('django.db.models.fields.DateField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'timepiece.invoice': {
            'Meta': {'object_name': 'Invoice'},
            'amount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '0'}),
            'date_paid': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'date_sent': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'invoice_number': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '0'}),
            'paid': ('django.db.models.fields.BooleanField', [], {}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'invoices'", 'null': 'True', 'to': u"orm['timepiece.Project']"})
        },
        u'timepiece.issue': {
            'Meta': {'object_name': 'Issue'},
            'adhoc': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'assigned_to': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'assigned_issues'", 'null': 'True', 'to': u"orm['auth.User']"}),
            'auto_created_during_import': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'due_date': ('django.db.models.fields.DateTimeField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            'feature': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'issues'", 'null': 'True', 'to': u"orm['timepiece.Feature']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'interface_plugin_number': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'number': ('django.db.models.fields.IntegerField', [], {'db_index': 'True', 'null': 'True', 'blank': 'True'}),
            'order': ('django.db.models.fields.BigIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'order2': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'issues'", 'to': u"orm['timepiece.Project']"}),
            'status': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'story_points': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'subject': ('django.db.models.fields.TextField', [], {'db_index': 'True'})
        },
        u'timepiece.issueattachment': {
            'Meta': {'object_name': 'IssueAttachment'},
            'attachment': ('django.db.models.fields.files.FileField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'issue': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'attachments'", 'to': u"orm['timepiece.Issue']"}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        u'timepiece.issuecomment': {
            'Meta': {'object_name': 'IssueComment'},
            'author': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'issue_comments'", 'to': u"orm['auth.User']"}),
            'comment': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'issue': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'comments'", 'to': u"orm['timepiece.Issue']"}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        },
        u'timepiece.issuehistory': {
            'Meta': {'object_name': 'IssueHistory'},
            'after': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'before': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'created_by': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'issue_id': ('django.db.models.fields.IntegerField', [], {'db_index': 'True'})
        },
        u'timepiece.issuepoints': {
            'Meta': {'unique_together': "(('user', 'issue'),)", 'object_name': 'IssuePoints'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'issue': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'issue_points'", 'to': u"orm['timepiece.Issue']"}),
            'points': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'user_points'", 'to': u"orm['auth.User']"})
        },
        u'timepiece.issuestatus': {
            'Meta': {'unique_together': "(('name', 'business'),)", 'object_name': 'IssueStatus'},
            'business': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'stati'", 'to': u"orm['timepiece.Business']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        u'timepiece.location': {
            'Meta': {'object_name': 'Location'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'slug': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'})
        },
        u'timepiece.personschedule': {
            'Meta': {'object_name': 'PersonSchedule'},
            'end_date': ('django.db.models.fields.DateField', [], {}),
            'hours_per_week': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'unique': 'True', 'null': 'True'})
        },
        u'timepiece.project': {
            'Meta': {'ordering': "('name', 'status', 'type')", 'object_name': 'Project'},
            'activity_group': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'activity_group'", 'null': 'True', 'to': u"orm['timepiece.ActivityGroup']"}),
            'billable': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'budget': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'business': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'new_business_projects'", 'to': u"orm['timepiece.Business']"}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'colour': (u'colorful.fields.RGBColorField', [], {'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'db_index': 'True', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'interface_plugin_number': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'invoice_at': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'db_index': 'True'}),
            'order': ('django.db.models.fields.BigIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'point_person': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'quote_uncertainty': ('django.db.models.fields.FloatField', [], {'default': '0.25', 'null': 'True', 'blank': 'True'}),
            'ratio_management': ('django.db.models.fields.FloatField', [], {'default': '0.2'}),
            'ratio_scope_creep': ('django.db.models.fields.FloatField', [], {'default': '0.25'}),
            'ratio_testing': ('django.db.models.fields.FloatField', [], {'default': '0.2'}),
            'short_description': ('django.db.models.fields.CharField', [], {'db_index': 'True', 'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'start_client_qa_at': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'start_dev_at': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'start_internal_qa_at': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'projects_with_status'", 'to': u"orm['timepiece.Attribute']"}),
            'status2': ('django.db.models.fields.CharField', [], {'default': "'pending'", 'max_length': '100', 'db_index': 'True'}),
            'tracker_url': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '255', 'blank': 'True'}),
            'type': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'projects_with_type'", 'to': u"orm['timepiece.Attribute']"}),
            'users': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'user_projects'", 'symmetrical': 'False', 'through': u"orm['timepiece.ProjectRelationship']", 'to': u"orm['auth.User']"})
        },
        u'timepiece.projectcontract': {
            'Meta': {'object_name': 'ProjectContract'},
            'end_date': ('django.db.models.fields.DateField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'num_hours': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'contracts'", 'to': u"orm['timepiece.Project']"}),
            'start_date': ('django.db.models.fields.DateField', [], {}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'upcomming'", 'max_length': '32'})
        },
        u'timepiece.projecthours': {
            'Meta': {'unique_together': "(('week_start', 'project', 'user'),)", 'object_name': 'ProjectHours'},
            'hours': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['timepiece.Project']"}),
            'published': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'week_start': ('django.db.models.fields.DateField', [], {})
        },
        u'timepiece.projectrelationship': {
            'Meta': {'unique_together': "(('user', 'project'),)", 'object_name': 'ProjectRelationship'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'project_relationships'", 'to': u"orm['timepiece.Project']"}),
            'types': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "'project_relationships'", 'blank': 'True', 'to': u"orm['timepiece.RelationshipType']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'project_relationships'", 'to': u"orm['auth.User']"})
        },
        u'timepiece.rate': {
            'Meta': {'object_name': 'Rate'},
            'amount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'billable_amount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'rate'", 'to': u"orm['timepiece.Project']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'velocity': ('django.db.models.fields.FloatField', [], {'default': '1'}),
            'work_ratio': ('django.db.models.fields.FloatField', [], {'default': '0'})
        },
        u'timepiece.redminetotimepiecebusinessmapping': {
            'Meta': {'object_name': 'RedmineToTimepieceBusinessMapping'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'redmine_business_name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'timepiece_business_name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        u'timepiece.redminetotimepieceprojectmapping': {
            'Meta': {'object_name': 'RedmineToTimepieceProjectMapping'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'redmine_project_code': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'timepiece_business_name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'timepiece_project_code': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        u'timepiece.relationshiptype': {
            'Meta': {'object_name': 'RelationshipType'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'slug': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'})
        },
        u'timepiece.salary': {
            'Meta': {'object_name': 'Salary'},
            'amount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'bonus': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'date': ('django.db.models.fields.DateField', [], {}),
            'expenses': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'leave_accrued': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'leave_taken': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'locked': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'paye': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'sick_days': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'uif': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        },
        u'timepiece.trafficchecklist': {
            'Meta': {'object_name': 'TrafficChecklist'},
            'business': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['timepiece.Business']", 'blank': 'True'}),
            'comments': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'created_by': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'traffic_checklist_created_by'", 'to': u"orm['auth.User']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'modified_by': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'traffic_checklist_modified_by'", 'blank': 'True', 'to': u"orm['auth.User']"}),
            'passed': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'db_index': 'True'})
        },
        u'timepiece.trafficchecklistitem': {
            'Meta': {'object_name': 'TrafficChecklistItem'},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'issue': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['timepiece.Issue']", 'null': 'True', 'blank': 'True'}),
            'msg': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'passed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['timepiece.Project']", 'null': 'True', 'blank': 'True'}),
            'traffic_checklist': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'items'", 'blank': 'True', 'to': u"orm['timepiece.TrafficChecklist']"})
        },
        u'timepiece.usernotification': {
            'Meta': {'object_name': 'UserNotification'},
            'applies_on': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'msg': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'notification_type': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'seen': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'notifications'", 'to': u"orm['auth.User']"})
        },
        u'timepiece.userprofile': {
            'Meta': {'object_name': 'UserProfile'},
            'amount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            'authenticate_token': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'billable_amount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '8', 'decimal_places': '2'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'project_names_to_ignore': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'profile'", 'unique': 'True', 'to': u"orm['auth.User']"})
        }
    }

    complete_apps = ['timepiece']