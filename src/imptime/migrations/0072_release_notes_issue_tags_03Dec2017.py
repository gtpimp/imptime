
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue tags",
                content="first version of issue tags implemented. works for multiple issue selection too").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0071_release_notes_attachments_removed__01Dec2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
