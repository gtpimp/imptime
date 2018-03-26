
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="work summary",
                content="a new global page which shows a daily summary of things that happened has been added. first draft, lets see if it's useful").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0130_release_notes_invoicing_force_to_h_26Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
