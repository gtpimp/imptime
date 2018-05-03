
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="isuse time summary column",
                content="the issue list has a column summarising all times for that issue (for Mia)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0156_release_notes_fullscreen_issue_edi_02May2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
