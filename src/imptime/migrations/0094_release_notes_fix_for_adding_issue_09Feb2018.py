
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="fix for adding issues to features",
                content="fixed a bug where if you select multiple issues to group to a feature it used to fail").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0093_merge_20180208_1155'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
