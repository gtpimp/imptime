
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="miens",
                content="a mien is like a mode. there are a few built in miens, for the moment they don't do much, but over time they will affect what fields you see on which pages, to help reduce clutter").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0100_release_notes_project_sorting_21Feb2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
