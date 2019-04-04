
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="wiki fix",
                content="fixed bug creating new wiki pages ").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0316_release_notes_old_imptime_bug_03Apr2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
