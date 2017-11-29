
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue estimate col restored",
                content="devs can access the issue estimates from the issue list again").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0059_release_notes_split_pane_28Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
