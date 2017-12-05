
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="new issue sprint selector",
                content="made it more obvious what the sprint selector is on the new issue sidebar").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0075_release_notes_move_issue_to_sprint_05Dec2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
