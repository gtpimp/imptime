
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="dev mien",
                content="in the dev mien, users see their own estimate on the issues list only in the spec mien, users see all user estimates (if they have that permission)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0105_release_notes_default_mien_01Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
