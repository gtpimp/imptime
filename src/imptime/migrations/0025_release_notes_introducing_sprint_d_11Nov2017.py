
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="introducing sprint deadlines",
                content="when clicking on a sprint in the sprint list, the sidebar shows a place to manage deadlines.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0024_release_notes_firefox_11Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
