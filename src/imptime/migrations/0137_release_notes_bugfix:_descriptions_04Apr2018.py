
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bugfix: descriptions with issue in the name",
                content="fix for bug, caused by enriched issue descriptions, which was preventing descriptions having the word 'issues' in the name").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0136_release_notes_issues_in_descriptio_30Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
