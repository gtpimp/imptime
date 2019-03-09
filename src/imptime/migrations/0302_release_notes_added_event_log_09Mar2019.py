
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="added event log",
                content="added event log menu item, allow viewing daily events on a calendar").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0301_release_notes_project_recon_06Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
