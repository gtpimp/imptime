
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="inbox review schedule problem",
                content="the problem page shows Inbox sprints which don't have a review cycle").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0205_release_notes_nudger_handles_adhoc_24Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
