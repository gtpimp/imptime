
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="feature bulk import",
                content="feature bulk import can import images. And also auto-create issues during import").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0254_auto_20180930_2223'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
