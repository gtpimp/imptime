
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="permission websockets",
                content="when permissions are changed, they will take affect without a page reload").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0268_release_notes_middle_click_attachm_18Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
