
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue adhoc",
                content="adhoc issue are displayed correctly, and can be changed (called issue type)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0057_release_notes_sprint_sorting_faste_28Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
