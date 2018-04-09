
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="fix for attachments",
                content="attachments are working again").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0143_release_notes_default_project_06Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
