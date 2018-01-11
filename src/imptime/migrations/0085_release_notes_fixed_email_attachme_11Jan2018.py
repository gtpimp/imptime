
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="fixed email attachments",
                content="emails to impbox with attachments are correctly processed").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0084_visualspecdocument_md5sum'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
