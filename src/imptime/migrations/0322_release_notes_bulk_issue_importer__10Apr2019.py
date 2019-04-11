
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bulk issue importer supports tags",
                content="when doing a bulk issue create, you can specify the tags at the same time").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0321_release_notes_multi-select_sprints_09Apr2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
