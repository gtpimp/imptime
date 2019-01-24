
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="attachment annotation bug",
                content="annotations fixed by disabling the image modal. it will come back, this is a short-term fix to restore functionality").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0286_release_notes_added_button_to_crea_21Jan2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
