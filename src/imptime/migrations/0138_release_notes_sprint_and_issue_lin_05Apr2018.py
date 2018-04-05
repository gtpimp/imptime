
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint and issue links can middle click",
                content="most sprint and issue links support middle click to open in a new tab").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0137_release_notes_bugfix:_descriptions_04Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
