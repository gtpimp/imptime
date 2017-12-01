
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="attachments removed from old imptime",
                content="the attachments section has been removed from old imptime. all existing migrations have been copied to the new format in new imptime, so nothing is lost").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0070_release_notes_headers_for_lists_30Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
