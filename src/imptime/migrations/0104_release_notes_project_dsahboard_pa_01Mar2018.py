
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="project dsahboard pagination increased",
                content="(olivia) show 10 dashboards instead of just one at a time").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0103_release_notes_project_dashboard_bu_01Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
