
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="extra sprint columns",
                content="lots more sprint columns available on the sprints list").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0177_release_notes_scrolling_fixes_25May2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
