
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue count in sprint list",
                content="when creating issues or moving issues, the count in the sprint list is correctly updated").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0067_release_notes_apple_command_key_su_29Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
