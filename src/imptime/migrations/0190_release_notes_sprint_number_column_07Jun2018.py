
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint number column",
                content="added sprint id and number column. number is preferred and starts from 1 for each project, but developers might prefer the id field for the moment").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0189_release_notes_nudge_sorting_07Jun2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
