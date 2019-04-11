
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="company page bug",
                content="the company works again").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0322_auto_20190410_2016'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
