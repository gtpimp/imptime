
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="autoclock",
                content="fix error when clocking in without a comment").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0097_release_notes_tags_case_insensitiv_13Feb2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
