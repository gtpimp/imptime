
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="iissue icons",
                content="removed some unused icons and updated the feature icons").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0061_release_notes_create_issue_by_emai_29Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
