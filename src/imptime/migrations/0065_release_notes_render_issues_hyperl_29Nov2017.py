
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="render issues hyperlink",
                content="the num issues column on the sprints list renders link a link").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0064_release_notes_more_splitter_bars_29Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
