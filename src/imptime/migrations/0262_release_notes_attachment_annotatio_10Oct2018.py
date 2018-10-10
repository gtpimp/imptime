
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="attachment annotations",
                content="clicking on an attachment opens it in full screen, and you can drag arrows and circles on it. for both issues and attachments").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0261_auto_20181010_1353'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
