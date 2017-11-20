
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="can close search results",
                content="added a button for closing them. also make it more obvious you can re-show them by clicking the down-arrow").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0042_release_notes_nudges_18Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
