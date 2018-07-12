
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="select mien when copying",
                content="when cloning a mien, or editing a mien, that mien becomes the selected mien (for Mia)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0178_release_notes_extra_sprint_columns_27May2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
