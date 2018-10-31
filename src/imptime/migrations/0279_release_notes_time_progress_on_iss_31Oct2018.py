
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="time progress on issue list",
                content="over issues show as a red and blue bar to show how over they are").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0278_release_notes_sprint_list_merged_31Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
