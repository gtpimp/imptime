
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="timesheet import as comments",
                content="timesheets insert their description into the issue comments").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0132_release_notes_issue_feature_bugfix_27Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
