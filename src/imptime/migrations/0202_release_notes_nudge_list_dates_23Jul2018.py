
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="nudge list dates",
                content="the nudge list shows estimated times when each item will be completed, based on the issue estimate is applicable").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0201_nudge_estimated_hours'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
