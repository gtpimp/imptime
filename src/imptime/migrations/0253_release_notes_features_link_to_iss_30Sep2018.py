
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="features link to issues",
                content="from a feature testable, it is possible to link to a new or existing issue. and from the issue you can click back to the feature").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0252_release_notes_bookmarks_30Sep2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
