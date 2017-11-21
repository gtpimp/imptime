
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="testable quality check",
                content="testables which are too long are displayed in red. this is to prevent overly wordy testables and encourage succintness").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0047_release_notes_markdown_in_issues_21Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
