
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Enabled international timezones",
                content="This could cause some odd problesm with 2 hours offsets, but should include international date support").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0179_release_notes_select_mien_when_cop_27May2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
