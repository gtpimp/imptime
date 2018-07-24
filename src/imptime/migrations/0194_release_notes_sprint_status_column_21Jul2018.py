
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint status column is more helpful",
                content="the sprint status column show progress through the sprint, as well as some useful progress info").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0193_release_notes_sprint_state_summary_18Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
