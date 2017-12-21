
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="tag columns",
                content="on the wide issue list, all tags are displayed in their own column").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0080_release_notes_issue_features_are_e_21Dec2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
