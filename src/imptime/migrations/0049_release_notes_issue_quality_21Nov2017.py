
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue quality",
                content="the issue names must be less than 7 long words too, same as testables").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0048_release_notes_testable_quality_che_21Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
