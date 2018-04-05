
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint list filter on open only persists",
                content="when the toggle for showing closed sprints is set, this is remembered until you change projects").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0140_release_notes_cancel_buttons_05Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
