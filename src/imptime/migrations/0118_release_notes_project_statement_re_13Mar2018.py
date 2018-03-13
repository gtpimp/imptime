
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="project statement rejig",
                content="slight rejig to the columns on the project statement, nothing too serious, affects clients that have commission").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0117_release_notes_hours_tooltip_06Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
