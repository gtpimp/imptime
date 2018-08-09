
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="editing old clock entries",
                content="users can't edit old clock entries (2 days) without permission.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0234_release_notes_emacs_timesheet_impo_09Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
