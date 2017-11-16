
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="feature issues",
                content="added an icon to expand and collapse features from the list directly").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0033_release_notes_timesheet_bug_fix_16Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
