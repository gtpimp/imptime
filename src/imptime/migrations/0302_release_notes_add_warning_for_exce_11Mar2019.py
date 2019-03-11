
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="add warning for excessive estimate",
                content="adds a warning to the issues page when an estimate exceeds 4 hours").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0301_release_notes_project_recon_06Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
