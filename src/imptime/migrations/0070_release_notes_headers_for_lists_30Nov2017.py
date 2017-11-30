
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="headers for lists",
                content="project, sprint and issue lists have a header bar").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0069_release_notes_create_issue_for_dif_30Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
