
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="add estimate by user card",
                content="add a sprint card that displays the total estimates for each user that have worked on the sprint").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0304_release_notes_add_issues_by_status_11Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
