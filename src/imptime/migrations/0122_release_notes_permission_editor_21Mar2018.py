
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="permission editor",
                content="on the project dropdown menu, select Users. Here you can edit user permissions. ").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0121_release_notes_sprint_rates_and_vel_21Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
