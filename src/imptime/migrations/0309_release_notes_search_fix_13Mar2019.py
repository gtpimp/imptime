
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="search fix",
                content="searches now show results within the selected project and sprint first").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0308_merge_20190312_2312'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
