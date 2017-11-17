
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue sidebar toggle",
                content="the issue sidebar doens't show by default anymore. there is a toggle in the toolbar to turn it on and off").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0036_release_notes_issue_estimates_from_17Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
