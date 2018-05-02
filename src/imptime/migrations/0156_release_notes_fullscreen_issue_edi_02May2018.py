
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="fullscreen issue editor",
                content="experimental feature to maximise the width of an issue. it's intended for use during meeting minute capturing, but works on all issues").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0155_release_notes_minutes_iossues_and__01May2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
