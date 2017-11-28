
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="split pane",
                content="issue list now has a draggable split pane").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0058_release_notes_issue_adhoc_28Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
