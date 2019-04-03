
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="old imptime bug",
                content="fixed bug from previous release for opening old imptime").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0315_merge_20190402_1926'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
