
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint status is editable",
                content="either click the sprint name on the sprint sidebar, or in the sprint list status column.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0022_release_notes_creating_bulk_issues_09Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
