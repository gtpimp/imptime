
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="fixed new issue list bus",
                content="can create and delete issues, and scrolling shows more fields").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0247_release_notes_issue_list_faster_16Sep2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
