
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="styling",
                content="new look and feel applied. sorry if there are bugs, code is diverging too much, had to release").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0216_release_notes_estimated_dev_time_l_30Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
