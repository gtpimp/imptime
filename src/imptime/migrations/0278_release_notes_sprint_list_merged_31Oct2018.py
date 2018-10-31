
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint list merged",
                content="sprints of type spec and sprint are merged into a new section called 'active'").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0277_release_notes_issue_progress_bar_31Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
