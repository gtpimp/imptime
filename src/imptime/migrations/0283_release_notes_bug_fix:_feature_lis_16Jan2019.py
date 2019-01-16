
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bug fix: feature list page works again",
                content="").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0282_release_notes_feature_bug_fix_07Nov2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
