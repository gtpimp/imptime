
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Added Sprint Cards",
                content="Added Cards as an option from the selected sprint's dropdown menu, added a budget card which displays the current budget for the selected sprint").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0293_release_notes_Clock_fix_19Feb2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
