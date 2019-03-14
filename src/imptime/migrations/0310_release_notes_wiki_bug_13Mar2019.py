
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="wiki bug",
                content="fixed page refresh bug when clicking on a wiki page").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0309_release_notes_search_fix_13Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
