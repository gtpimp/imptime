
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="cost summary csv export bug",
                content="fixed the csv export for cost summary export and project statement export").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0286_release_notes_added_button_to_crea_21Jan2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
