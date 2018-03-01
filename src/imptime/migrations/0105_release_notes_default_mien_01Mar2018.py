
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="default mien",
                content="set the default mien to dev so new users don't get a blank screen").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0104_release_notes_project_dsahboard_pa_01Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
