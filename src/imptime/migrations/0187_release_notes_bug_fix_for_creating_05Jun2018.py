
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bug fix for creating projects",
                content="").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0186_release_notes_bug_fix_for_creating_04Jun2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
