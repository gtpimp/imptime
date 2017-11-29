
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="apple command key support",
                content="untested, but this might work. richard, give it a try").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0066_release_notes_issue_creation_for_f_29Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
