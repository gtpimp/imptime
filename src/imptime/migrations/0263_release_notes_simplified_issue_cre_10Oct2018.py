
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="simplified issue creation",
                content="project and sprint selector are slightly simpler").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0262_release_notes_attachment_annotatio_10Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
