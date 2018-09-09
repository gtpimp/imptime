
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="",
                content="").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0244_release_notes_actual_time_dispaly_06Sep2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
