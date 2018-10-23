
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="wiki attachments",
                content="can add attachments to wiki pages").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0272_auto_20181023_2033'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
