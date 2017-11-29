
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="group sprints by type",
                content="instead of having sprint type filter, show all types in a sectioned list").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0062_release_notes_iissue_icons_29Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
