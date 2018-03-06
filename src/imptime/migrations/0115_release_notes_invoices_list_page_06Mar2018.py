
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="invoices list page",
                content="there is now an invoice list page, it's only a start, not editable yet. invoices are only viewable for projects you have view invoice permissions on").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0114_release_notes_pproject_statement_s_05Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
