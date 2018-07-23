
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="rates are editable",
                content="on the project statement page, to save managers having to go to a separate page").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0196_release_notes_nudge_list_longer_22Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
