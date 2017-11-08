
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="change issue status from the list",
                content="clicking on the issue status or assigned user directly on the issue list shows the edit popup, so you don't need to go to the sidebar").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0017_release_notes_shortcut_to_open_spr_08Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
