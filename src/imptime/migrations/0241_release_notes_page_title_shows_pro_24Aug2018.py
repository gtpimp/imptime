
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="page title shows project",
                content="implemented for issues page and sprints page, shows in the browser title name").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0240_release_notes_emacs_importer_old_e_22Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
