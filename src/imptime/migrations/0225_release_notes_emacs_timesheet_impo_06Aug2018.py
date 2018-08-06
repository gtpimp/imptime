
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="emacs timesheet importer",
                content="added more logging during timesheet import to help with diagnosing unimported time").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0224_release_notes_sprint_snapshots_03Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
