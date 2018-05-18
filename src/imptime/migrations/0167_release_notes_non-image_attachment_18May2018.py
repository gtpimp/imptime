
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="non-image attachments display better",
                content="attachmentrs that are docs or excel etc previously now show the icon and filename to it's easier to use").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0166_release_notes_attachments_can_be_a_18May2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
