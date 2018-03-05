
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="pproject statement shows invoices",
                content="in the project statement, the finance user can see the invoice summary (with appropriate permissions)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0113_release_notes_project_statement_do_04Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
