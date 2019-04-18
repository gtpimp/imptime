
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Fixed issue scrolls",
                content="Removed extra overflow scrolls from issue list").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0329_merge_20190418_1307'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
