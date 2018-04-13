
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="work summary by user",
                content="the work summary page shows all users works, for projects and users you have access to").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0151_release_notes_single_value_selecto_12Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
