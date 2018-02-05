# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    Business = apps.get_model('timepiece', 'Business')
    ProjectDeadlineType = apps.get_model('timepiece', 'ProjectDeadlineType')
    DEFAULT_PROJECT_DEADLINE_TYPES = ( ('start_dev', 'Start development'),
                                       ('start_internal_qa', 'Start internal QA'),
                                       ('end_external_qa', 'End external QA') )

    for business in Business.objects.all():
        if not ProjectDeadlineType.objects.filter(business=business).exists():
            for deadline_type in DEFAULT_PROJECT_DEADLINE_TYPES:
                ProjectDeadlineType.objects.get_or_create(business=business, name=deadline_type[1])

        
class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0087_release_notes_bug_fix_for_sprint_c_29Jan2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
