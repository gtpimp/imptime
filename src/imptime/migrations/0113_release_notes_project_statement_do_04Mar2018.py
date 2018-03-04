
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="project statement download",
                content="fixed bug in the csv exporter for the project statement main summary section").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0112_release_notes_emacs_helper_only_on_04Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
