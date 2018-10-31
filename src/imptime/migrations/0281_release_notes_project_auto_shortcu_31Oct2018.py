
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="project auto shortcuts",
                content="the project menu shows recent projects in a dropdown").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0280_release_notes_emacs_sprint_31Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
