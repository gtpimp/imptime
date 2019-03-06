
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="project recon",
                content="very early first version created, don't use yet").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0300_release_notes_sprint_recon_page_05Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
