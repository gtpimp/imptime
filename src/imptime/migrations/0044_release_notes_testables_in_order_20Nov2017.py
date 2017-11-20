
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="testables in order",
                content="testables are shown in the order that they're created").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0043_release_notes_can_close_search_res_20Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
