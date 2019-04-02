
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="new sprint statuses",
                content="added sprint statuses to match the 10 step process (tm)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0313_insert_new_sprint_statuese'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
