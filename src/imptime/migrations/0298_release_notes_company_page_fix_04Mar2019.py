
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="company page fix",
                content="fixed a bug preventing the company page, and also the timesheet page, from displaying").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0297_release_notes_sprint_creation_bug_04Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
