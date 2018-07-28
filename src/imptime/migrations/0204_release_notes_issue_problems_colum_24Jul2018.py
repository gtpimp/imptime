
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue problems column.",
                content="there is an new issues column called problems. this is currently showing if the issue needs testables, more problem will be added later").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0203_release_notes_rates_with_commissio_24Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
