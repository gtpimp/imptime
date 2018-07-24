
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="management issue types",
                content="new issue types added for different types of management").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0207_release_notes_sprint_reviews_24Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
