
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="hours tooltip",
                content="most fields that look like time have a tooltip explaining the time and showing the decimal equivalent. this is shown in the top right of the screen.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0116_release_notes_actuals_per_sprint_o_06Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
