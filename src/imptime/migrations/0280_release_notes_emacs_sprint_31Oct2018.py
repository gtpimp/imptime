
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="emacs sprint",
                content="added emacs shortcut on the sprint sidebar").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0279_release_notes_time_progress_on_iss_31Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
