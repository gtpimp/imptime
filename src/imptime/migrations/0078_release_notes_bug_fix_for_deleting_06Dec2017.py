
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bug fix for deleting issues with nudges",
                content="changed the database so that issues associated with nudges can still be deleted").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0077_auto_20171206_1214'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
