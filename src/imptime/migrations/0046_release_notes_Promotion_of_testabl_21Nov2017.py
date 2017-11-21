
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Promotion of testables",
                content="Testables can be converted into a new issue by clicking the Promote To Issue button").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0045_merge_20171120_1150'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
