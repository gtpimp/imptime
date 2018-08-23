
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="quick issue creation",
                content="in the menu bar is a quick button to create a new issue, useful for times of panic").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0237_release_notes_issue_dependancies_12Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
