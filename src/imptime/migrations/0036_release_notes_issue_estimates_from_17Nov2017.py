
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue estimates from list",
                content="the issue list shows the estimate and progress column by default, and clicking it allows editing directly ").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0035_release_notes_username_16Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
