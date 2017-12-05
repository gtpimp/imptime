
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="move issue to sprint bugfix",
                content="fixed problem with moving issues to sprints, was always a copy").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0074_release_notes_copy_issues_04Dec2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
