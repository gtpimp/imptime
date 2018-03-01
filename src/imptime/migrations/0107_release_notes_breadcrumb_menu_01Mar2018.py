
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="breadcrumb menu",
                content="hovering over a breadcrumb item shows a menu suitable for that thing. this duplicates the existing functionality of the blue buttons in the toolbar, but makes them easier to access. the blue buttons will probably be removed soon").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0106_release_notes_dev_mien_01Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
