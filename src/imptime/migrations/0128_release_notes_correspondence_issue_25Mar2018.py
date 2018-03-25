
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="correspondence issue type",
                content="added a new issue type: correspondence. issues created by email are allocated to this type").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0127_release_notes_imptime_email_se_24Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
