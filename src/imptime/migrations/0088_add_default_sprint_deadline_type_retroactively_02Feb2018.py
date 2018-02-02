# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    Project = apps.get_model('timepiece', 'Business')
    ProjectDeadlineTypes = apps.get_model('timepiece', 'ProjectDeadlineType')
    ProjectDeadlineDefaults = ( ('start_dev', 'Start development'),
                                  ('start_internal_qa', 'Start internal QA'),
                                  ('end_external_qa', 'End external QA') )
    
    for project in Project.objects.all():
        if not ProjectDeadlineTypes.objects.filter(business=Project):
            ProjectDeadlineTypes.DEFAULT_PROJECT_DEADLINE_TYPES = ProjectDeadlineDefaults
        
        
        
class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0087_release_notes_bug_fix_for_sprint_c_29Jan2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
