
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="firefox",
                content="fixed bug preventing sprints showing up in firefox").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0023_release_notes_sprint_status_is_edi_10Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
