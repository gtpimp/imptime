
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="attachments can be added easier",
                content="attachments can be added to issues without clicking the manage button.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0165_release_notes_features_issues_are__18May2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
