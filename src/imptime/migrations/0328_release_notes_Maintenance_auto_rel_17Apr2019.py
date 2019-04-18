
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Maintenance auto reload",
                content="Triggering a page refresh after maintenance mode").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0327_release_notes_wiki_list_bug_16Apr2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
