
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="timesheet bug fix",
                content="fix for timesheet importing which was saying 'error issue'").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0032_release_notes_bug_fixes_in_issue_d_15Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
