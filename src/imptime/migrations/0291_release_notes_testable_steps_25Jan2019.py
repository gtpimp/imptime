
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="testable steps",
                content="lines within testables are now objects, as a first step to support cascading testables. use the bulk edit link if you want to create a long testable easily").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0290_release_notes_testable_quality_che_24Jan2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
