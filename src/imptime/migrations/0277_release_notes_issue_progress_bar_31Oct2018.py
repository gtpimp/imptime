
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue progress bar",
                content="tidied up the estimate column").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0276_update implicitdesign company'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
