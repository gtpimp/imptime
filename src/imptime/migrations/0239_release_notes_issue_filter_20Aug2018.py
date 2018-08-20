
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue filter",
                content="on the issue list is a filter button. use this to filter issues by status. ").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0238_release_notes_quick_issue_creation_20Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
