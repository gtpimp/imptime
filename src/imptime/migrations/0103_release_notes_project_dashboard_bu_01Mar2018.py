
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="project dashboard bugfix",
                content="wasn't working").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0102_release_notes_auto-clock_bug_fix_28Feb2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
