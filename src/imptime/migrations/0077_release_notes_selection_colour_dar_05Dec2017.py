
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="selection colour darker",
                content="made the row highlight colour for selected rows darker (for keith)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0076_release_notes_new_issue_sprint_sel_05Dec2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
