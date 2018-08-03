
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint snapshots",
                content="first version of sprint snapshots in. from the sprint breadcrumb menu, select snapshots and away you go.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0223_auto_20180803_0944'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
