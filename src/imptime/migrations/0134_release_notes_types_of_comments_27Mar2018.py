
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="types of comments",
                content="issue comments have a type. it's not editable, but it indicates where the comment came from. the interesting one is going to be raw spec, coming soon").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0133_release_notes_timesheet_import_as__27Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
