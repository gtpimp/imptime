
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="confirm cancel",
                content="cancel buttons on issue editing and other places do a confirm first").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0197_release_notes_rates_are_editable_23Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
