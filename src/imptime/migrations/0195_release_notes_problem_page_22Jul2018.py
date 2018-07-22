
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="problem page",
                content="added more problem types to the company problem page").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0194_release_notes_sprint_status_column_21Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
