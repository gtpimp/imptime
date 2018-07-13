
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue creation by email is more lenient",
                content="issues can be created for projects where the user email is unknown or the project doesn't belong to the user. This is more useful for support at this stage than having strict user checking").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0191_release_notes_manual_nudge_list_it_09Jun2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
