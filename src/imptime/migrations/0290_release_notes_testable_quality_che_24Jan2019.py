
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="testable quality check",
                content="you can override the quality check by starting a line with a colon (:)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0289_merge_20190124_2000'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
