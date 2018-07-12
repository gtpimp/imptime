
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="company problem page layout fixed",
                content="company problem page has pagination, is full width, and doesn't show budget problems").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0182_release_notes_basic_calendar_imple_01Jun2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
