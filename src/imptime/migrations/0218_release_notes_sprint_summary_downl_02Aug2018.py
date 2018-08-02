
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint summary download bug",
                content="fixed the download button for exporting the sprint summary to csv").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0217_release_notes_styling_31Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
