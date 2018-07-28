
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="rates with commission",
                content="where projects have commission, show the editable rate including that amount.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0202_release_notes_nudge_list_dates_23Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
