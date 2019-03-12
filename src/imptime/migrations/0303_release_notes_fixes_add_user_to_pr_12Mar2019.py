
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="fixes add user to project",
                content="fixes issue where imptime would fall over when trying to add an user to a project").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0302_release_notes_added_event_log_09Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
