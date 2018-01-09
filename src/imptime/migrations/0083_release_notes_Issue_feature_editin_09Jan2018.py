
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Issue feature editing",
                content="It is possible to select an issue's feature (parent issue) from the sidebar for single and multiple selections").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0082_merge_20180107_2139'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
