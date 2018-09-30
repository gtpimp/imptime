
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bookmarks",
                content="add bookmark functionality, in the main menu, for remembering frequent pages. Uses cookies so doesn't remember across devices").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0251_release_notes_feature_tree_first_v_25Sep2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
