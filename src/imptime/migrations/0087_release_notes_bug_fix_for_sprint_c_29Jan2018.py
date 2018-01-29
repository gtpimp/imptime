
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bug fix for sprint clone",
                content="cloned issues go to the sprint clone, instead of remaining in the original sprint").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0086_release_notes_update_multiple_issu_12Jan2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
