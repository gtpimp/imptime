
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="search bug fix",
                content="searching on issue numbers now working properly").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0310_release_notes_wiki_bug_13Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
