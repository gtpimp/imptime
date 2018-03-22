
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="wiki markdown editor",
                content="the wiki markdown editor is nicer and has a toolbar").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0124_release_notes_better_wiki_permissi_22Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
