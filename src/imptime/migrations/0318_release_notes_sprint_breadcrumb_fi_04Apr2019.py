
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint breadcrumb fix",
                content="fixed an edge case where switching projects didn't reset the selected sprint").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0317_release_notes_wiki_fix_04Apr2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
