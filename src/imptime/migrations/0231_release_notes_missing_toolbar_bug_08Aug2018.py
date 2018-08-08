
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="missing toolbar bug",
                content="when the issue or sprint sidebar wasn't displayed, the toolbar was also hidden. fixed.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0230_release_notes_comprehensive_sprint_06Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
