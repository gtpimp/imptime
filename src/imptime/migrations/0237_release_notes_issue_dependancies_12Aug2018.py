
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue dependancies",
                content="issues can be made dependant on other issues. this shows up as a warning on the issue and in the sprint summary").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0236_release_notes_click_menus_10Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
