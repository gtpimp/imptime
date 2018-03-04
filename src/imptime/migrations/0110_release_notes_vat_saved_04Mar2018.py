
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="vat saved",
                content="vat is saved against invoices now, so that vat can change over time").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0109_release_notes_estimates_for_issue__04Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
