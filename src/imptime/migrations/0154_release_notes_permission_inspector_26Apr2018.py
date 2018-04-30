
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="permission inspector improvements",
                content="the permission inspector allows clicking anywhere on the element to select it").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0153_release_notes_permission_inspector_25Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
