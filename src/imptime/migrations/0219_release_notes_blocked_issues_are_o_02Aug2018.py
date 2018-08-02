
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="blocked issues are open",
                content="in the sprint state summary, issues that are blocked will now contribute to the total remaining dev time").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0218_release_notes_sprint_summary_downl_02Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
