
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="manual nudge list items",
                content="it's possible to add issues to the nudge list manually, and then sort them in the desired order").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0190_release_notes_sprint_number_column_07Jun2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
