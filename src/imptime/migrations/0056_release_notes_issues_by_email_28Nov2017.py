
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issues by email",
                content="bug fix, wasn't creating or sending an error").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0055_release_notes_quick_clocker_bug_fi_28Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
