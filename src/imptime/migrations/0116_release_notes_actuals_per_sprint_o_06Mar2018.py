
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="actuals per sprint or selected issues",
                content="in the sprint sidebar, and when selecting multiple isues, it's possible to see the actual time taken, together with calculated velocity. this combined with the estimated allows managers to confirm if we're on track or whether velocity needs adjusting").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0115_release_notes_invoices_list_page_06Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
