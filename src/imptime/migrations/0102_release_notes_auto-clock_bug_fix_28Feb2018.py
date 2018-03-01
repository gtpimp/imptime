
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="auto-clock bug fix",
                content="auto-clock bug fix made (was affecting olivia)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0101_release_notes_miens_28Feb2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
