
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Added warning for excessive estimate",
                content="A warning has been added to the existing warnings that popup on the issue page.
This is triggered when an estimate is set to anything larger than 8 hours.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0293_release_notes_Description_field_fo_13Feb2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
