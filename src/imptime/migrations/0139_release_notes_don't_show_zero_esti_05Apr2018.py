
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="don't show zero estimates",
                content="for issues which don't have an estimate, just dhow the actual. this helps with keeping ad-hoc issues clean").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0138_release_notes_sprint_and_issue_lin_05Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
