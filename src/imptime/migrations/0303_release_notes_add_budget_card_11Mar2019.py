
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="add budget card",
                content="add a sprint card that displays the editable budget and the amount spent so far").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0302_release_notes_add_warning_for_exce_11Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
