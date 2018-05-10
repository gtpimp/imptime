
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="user invite fixes",
                content="the user invite mechanism, with passowrd entry etc,is fixed").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0161_release_notes_configurable_miens_06May2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
