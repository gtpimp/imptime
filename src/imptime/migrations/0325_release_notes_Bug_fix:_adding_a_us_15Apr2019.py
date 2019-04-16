
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Bug fix: adding a user to a company",
                content="Fixed the bug when adding a user to a company. Updated company and project user pages to auto refresh the user table when you add or remove a user").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0324_merge_20190411_2028'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
