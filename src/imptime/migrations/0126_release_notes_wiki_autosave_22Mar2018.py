
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="wiki autosave",
                content="the wiki page autosaves after 5 seconds of inactivity").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0125_release_notes_wiki_markdown_editor_22Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
