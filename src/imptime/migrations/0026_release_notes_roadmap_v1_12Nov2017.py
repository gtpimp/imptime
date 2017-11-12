
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="roadmap v1",
                content="first version of roadmap in place (management tool)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0025_release_notes_introducing_sprint_d_11Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
