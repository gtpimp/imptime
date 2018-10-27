
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint proposal",
                content="first draft of sprint proposal brought into new imptime").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0273_release_notes_wiki_attachments_23Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
