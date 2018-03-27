
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue feature bugfix",
                content="it's now possible to toggle issues as features again").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0131_release_notes_work_summary_26Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
