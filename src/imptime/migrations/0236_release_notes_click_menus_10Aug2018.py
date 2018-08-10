
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="click menus",
                content="menus require a click now. if you don't like it let me know, we think it causes less mistakes").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0235_release_notes_editing_old_clock_en_09Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
