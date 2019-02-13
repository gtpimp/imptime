
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="comment opacity",
                content="remove comment opacity to make it easier to read").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0291_release_notes_testable_steps_25Jan2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
