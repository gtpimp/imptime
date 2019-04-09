
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="multi-select sprints",
                content="you can multi select sprints using Control or Apple-Cmd. (grouped multi-select using shift is not implemented yet)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0320_release_notes_time_popup_removed_09Apr2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
