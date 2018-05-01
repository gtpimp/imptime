
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="minutes iossues and sprints",
                content="in the project dropdown menu is an option minutes. it opens an issue of type minutes. this is the beginning of a better minutes and correspondance handling mechanism").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0154_release_notes_permission_inspector_26Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
