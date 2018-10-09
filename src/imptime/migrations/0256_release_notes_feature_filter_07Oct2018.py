
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="feature filter",
                content="fix filter by project_id").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0255_release_notes_feature_bulk_import_01Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
