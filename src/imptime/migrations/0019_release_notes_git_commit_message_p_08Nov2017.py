
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="git commit message popup",
                content="on the issue sidebar, there is a link to show a typical git commit message (for glen)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0018_release_notes_change_issue_status__08Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
