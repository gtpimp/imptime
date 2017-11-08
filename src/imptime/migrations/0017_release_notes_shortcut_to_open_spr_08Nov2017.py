
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="shortcut to open sprint issues",
                content="Click on the issues column in the sprint list to go directly to the issues list for that sprint").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0016_release_notes_3oct2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
