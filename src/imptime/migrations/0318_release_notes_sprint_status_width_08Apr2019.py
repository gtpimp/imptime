
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint status width",
                content="if you enter mien configuration, remove the sprint status column, then bring it back again, it will be wider and easier to read").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0317_release_notes_wiki_fix_04Apr2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
