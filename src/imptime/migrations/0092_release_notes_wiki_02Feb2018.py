
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="wiki",
                content="first version of project wiki. not really a wiki but maybe it will be someday").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0091_auto_20180201_1545'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
