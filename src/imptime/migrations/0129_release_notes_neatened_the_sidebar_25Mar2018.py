
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="neatened the sidebar",
                content="move the tags into the main details section. removed the horizontal line separators. made the comments, testable and description more homogenous in style").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0128_release_notes_correspondence_issue_25Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
