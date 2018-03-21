
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint budget",
                content="Sprint budgets can be edited on the sprint rates screen, if you have edit_budget permission").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0122_release_notes_permission_editor_21Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
