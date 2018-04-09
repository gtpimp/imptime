
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="super user permissions removed",
                content="super users can't access all projects anymore. this makes the 'me' project private").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0144_release_notes_fix_for_attachments_09Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
