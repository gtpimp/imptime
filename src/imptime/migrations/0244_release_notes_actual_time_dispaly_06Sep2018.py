
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="actual time dispaly",
                content="bug for issues without an estimate, wasn't showing time").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0243_release_notes_executive_summary_24Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
