
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="added button to create issues from the feature tree on demand",
                content="").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0285_release_notes_bug_fix_for_search_r_18Jan2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
