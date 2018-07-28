
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue state consolidation",
                content="on-hold and discuss-with-client issue states are converted to blocked").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0210_release_notes_import_issue_type,_i_24Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
