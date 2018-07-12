
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="basic calendar implementation",
                content="it's possible to schedule issues, sprints and projects into a floating calendar, or using nudges").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0181_schedule_default'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
