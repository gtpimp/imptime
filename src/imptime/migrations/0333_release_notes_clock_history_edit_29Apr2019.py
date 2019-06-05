
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="clock history edit",
                content="fixed bug editing clock history entries").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0332_release_notes_project_archiving_28Apr2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
