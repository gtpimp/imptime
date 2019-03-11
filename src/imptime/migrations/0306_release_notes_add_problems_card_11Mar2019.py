
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="add problems card",
                content="add sprint card that displays all sprint problems, sprint warnings, and issue warnings for the sprint").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0305_release_notes_add_estimate_by_user_11Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
