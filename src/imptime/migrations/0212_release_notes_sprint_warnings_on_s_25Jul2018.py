
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint warnings on summary",
                content="if a sprint contains issues that are blocked, waiting, to be designed or cannot reproduce, they show as warnings in the sprint state summary column").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0211_release_notes_issue_state_consolid_25Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
