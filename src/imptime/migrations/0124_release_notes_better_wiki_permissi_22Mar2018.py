
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="better wiki permissions",
                content="if you don't have sensitive wiki permissions, you can't set wiki pagtes as sensitive. ").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0123_release_notes_sprint_budget_21Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
