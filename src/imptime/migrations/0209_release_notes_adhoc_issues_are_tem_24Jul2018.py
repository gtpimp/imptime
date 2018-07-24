
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="adhoc issues are temporary",
                content="adhoc issues should be converted to a different issue type. they will not appear in the problems list. ").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0208_release_notes_management_issue_typ_24Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
