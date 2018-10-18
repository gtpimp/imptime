
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="decision journal",
                content="there is a new menu entry under project for adding decision journals. you will need journal permissions to view and/or edit").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0266_auto_20181016_2140'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
