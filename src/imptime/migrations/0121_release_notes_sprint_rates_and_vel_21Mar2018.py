
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint rates and velocity are editable",
                content="on the sprint dropdown menu, select Rates. If you have sufficient permissions you can edit each user's rate and velocity").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0120_release_notes_show_actuals_by_tag_19Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
