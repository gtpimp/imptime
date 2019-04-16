
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="wiki list bug",
                content="wiki list pages show again. also feature list shows again.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0326_merge_20190416_2020'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
